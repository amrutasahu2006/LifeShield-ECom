const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const InventoryAlert = require('../models/InventoryAlert');
const { isPaymentVerificationValid } = require('../utils/paymentVerification');

const DEFAULT_LOW_STOCK_THRESHOLD = 5;
const ALLOWED_ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered'];

const normalizeOrderStatus = (status) => (
  ALLOWED_ORDER_STATUSES.includes(status) ? status : 'pending'
);

const ensureOrderStatuses = async (orders) => {
  const updates = [];
  for (const order of orders) {
    const normalizedStatus = normalizeOrderStatus(order.status);
    if (order.status !== normalizedStatus) {
      updates.push({
        updateOne: {
          filter: { _id: order._id },
          update: { $set: { status: normalizedStatus } }
        }
      });
      order.status = normalizedStatus;
    }
  }

  if (updates.length > 0) {
    await Order.bulkWrite(updates);
  }
};

const normalizeStock = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
};

const normalizeThreshold = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : DEFAULT_LOW_STOCK_THRESHOLD;
};

const buildRequiredQuantities = (cartItems) => {
  const requiredByProductId = new Map();

  for (const item of cartItems) {
    const productId = item.product?._id?.toString();
    const quantity = Number(item.quantity);

    if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
      return { error: 'Invalid cart item quantity' };
    }

    requiredByProductId.set(productId, (requiredByProductId.get(productId) || 0) + Math.floor(quantity));
  }

  return { requiredByProductId };
};

const getUnavailableProductName = (productsById, requiredByProductId) => {
  for (const [productId, requiredQty] of requiredByProductId.entries()) {
    const product = productsById.get(productId);
    if (!product || normalizeStock(product.stock) < requiredQty) {
      return product?.name || 'Selected product';
    }
  }
  return null;
};

const reserveInventory = async (requiredByProductId) => {
  const reservedItems = [];

  for (const [productId, requiredQty] of requiredByProductId.entries()) {
    const updateResult = await Product.updateOne(
      { _id: productId, stock: { $gte: requiredQty } },
      { $inc: { stock: -requiredQty } }
    );

    if (updateResult.modifiedCount !== 1) {
      const product = await Product.findById(productId).select('name');
      throw new Error(`Product out of stock: ${product?.name || 'Selected product'}`);
    }
    reservedItems.push({ productId, quantity: requiredQty });

    const updatedProduct = await Product.findById(productId)
      .select('name sku stock lowStockThreshold');

    if (!updatedProduct) continue;

    const currentStock = normalizeStock(updatedProduct.stock);
    const threshold = normalizeThreshold(updatedProduct.lowStockThreshold);
    if (currentStock <= threshold) {
      console.warn(
        `[INVENTORY][LOW_STOCK] ${updatedProduct.name} (${updatedProduct.sku || updatedProduct._id.toString()}) stock is ${currentStock} (threshold ${threshold})`
      );

      await InventoryAlert.create({
        type: 'low_stock',
        product: updatedProduct._id,
        message: `${updatedProduct.name} stock is ${currentStock}. Restock recommended.`,
        threshold,
        currentStock
      });
    }
  }

  return reservedItems;
};

exports.createOrder = async (req, res) => {
  const { shippingAddress, paymentMethod, verifiedPayment } = req.body;
  let reservedItems = [];
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const requiredQuantitiesResult = buildRequiredQuantities(cart.items);
    if (requiredQuantitiesResult.error) {
      return res.status(400).json({ message: requiredQuantitiesResult.error });
    }
    const { requiredByProductId } = requiredQuantitiesResult;

    const productIds = [...requiredByProductId.keys()];
    const products = await Product.find({ _id: { $in: productIds } })
      .select('name stock lowStockThreshold');
    const productsById = new Map(products.map((product) => [product._id.toString(), product]));

    const unavailableProductName = getUnavailableProductName(productsById, requiredByProductId);
    if (unavailableProductName) {
      return res.status(400).json({ message: `Product out of stock: ${unavailableProductName}` });
    }

    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
      image: item.product.image,
      customComponents: item.customComponents || []
    }));

    const itemsPrice = cart.totalAmount;
    const shippingPrice = itemsPrice > 3000 ? 0 : 99;
    const taxPrice = parseFloat((itemsPrice * 0.1).toFixed(2));
    const totalPrice = parseFloat((itemsPrice + shippingPrice + taxPrice).toFixed(2));
    const isRazorpayPayment = paymentMethod === 'Razorpay';

    if (isRazorpayPayment) {
      if (
        !verifiedPayment ||
        !verifiedPayment.token ||
        !verifiedPayment.razorpayOrderId ||
        !verifiedPayment.razorpayPaymentId
      ) {
        return res.status(400).json({ message: 'Payment verification required before placing order' });
      }

      const isValidPayment = isPaymentVerificationValid({
        token: verifiedPayment.token,
        userId: req.user._id.toString(),
        razorpayOrderId: verifiedPayment.razorpayOrderId,
        razorpayPaymentId: verifiedPayment.razorpayPaymentId,
        amount: totalPrice
      });

      if (!isValidPayment) {
        return res.status(400).json({ message: 'Invalid payment verification. Please pay again.' });
      }
    }

    reservedItems = await reserveInventory(requiredByProductId);

    const createdOrder = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Card (Demo)',
      paymentResult: isRazorpayPayment
        ? {
            id: verifiedPayment.razorpayPaymentId,
            status: 'captured',
            update_time: new Date().toISOString()
          }
        : {
            id: 'DEMO_' + Date.now(),
            status: 'completed',
            update_time: new Date().toISOString()
          },
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: true,
      paidAt: new Date(),
      status: 'pending'
    });

    const earnedPoints = Math.floor(itemsPrice);
    if (earnedPoints > 0) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { loyaltyPoints: earnedPoints },
        $push: {
          loyaltyActivity: {
            $each: [{
              type: 'earn',
              title: `Purchase – Order #${createdOrder._id.toString().slice(-8).toUpperCase()}`,
              description: `${orderItems.length} item(s) purchased`,
              points: earnedPoints,
              reference: createdOrder._id.toString(),
              createdAt: new Date()
            }],
            $position: 0
          }
        }
      });
    }

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.status(201).json(createdOrder);
  } catch (err) {
    if (reservedItems.length > 0 && !err.message.startsWith('Product out of stock')) {
      await Promise.all(
        reservedItems.map((item) => Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } }))
      );
    }
    if (err.message.startsWith('Product out of stock')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    await ensureOrderStatuses(orders);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const normalizedStatus = normalizeOrderStatus(order.status);
    if (order.status !== normalizedStatus) {
      order.status = normalizedStatus;
      await order.save();
    }
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    await ensureOrderStatuses(orders);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!ALLOWED_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${ALLOWED_ORDER_STATUSES.join(', ')}`
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    if (status === 'processing' && !order.processedAt) {
      order.processedAt = new Date();
    }
    if (status === 'shipped' && !order.shippedAt) {
      order.shippedAt = new Date();
    }
    if (status === 'delivered') {
      order.deliveredAt = order.deliveredAt || new Date();
      order.isDelivered = true;
    }

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
