const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const InventoryAlert = require('../models/InventoryAlert');

const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD || 20);

exports.createOrder = async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    // Validate stock for all items before proceeding
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}, Requested: ${item.quantity}.` 
        });
      }
    }

    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
      image: item.product.image
    }));

    const itemsPrice = cart.totalAmount;
    const shippingPrice = itemsPrice > 100 ? 0 : 9.99;
    const taxPrice = parseFloat((itemsPrice * 0.1).toFixed(2));
    const totalPrice = parseFloat((itemsPrice + shippingPrice + taxPrice).toFixed(2));

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Card (Demo)',
      paymentResult: { id: 'DEMO_' + Date.now(), status: 'completed', update_time: new Date().toISOString() },
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: true,
      paidAt: new Date(),
      status: 'confirmed'
    });

    const earnedPoints = Math.floor(itemsPrice);
    if (earnedPoints > 0) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { loyaltyPoints: earnedPoints },
        $push: {
          loyaltyActivity: {
            $each: [{
              type: 'earn',
              title: `Purchase – Order #${order._id.toString().slice(-8).toUpperCase()}`,
              description: `${orderItems.length} item(s) purchased`,
              points: earnedPoints,
              reference: order._id.toString(),
              createdAt: new Date()
            }],
            $position: 0
          }
        }
      });
    }

    // Update stock
    for (const item of cart.items) {
      const previousStock = item.product.stock;
      const updatedProduct = await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      const crossedLowStockThreshold =
        updatedProduct &&
        previousStock > LOW_STOCK_THRESHOLD &&
        updatedProduct.stock <= LOW_STOCK_THRESHOLD;

      if (crossedLowStockThreshold) {
        await InventoryAlert.create({
          type: 'low_stock',
          product: updatedProduct._id,
          message: `${updatedProduct.name} stock dropped to ${updatedProduct.stock}. Restock recommended.`,
          threshold: LOW_STOCK_THRESHOLD,
          currentStock: updatedProduct.stock
        });
      }
    }

    // Clear cart
    cart.items = []; cart.totalAmount = 0; await cart.save();

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
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
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
