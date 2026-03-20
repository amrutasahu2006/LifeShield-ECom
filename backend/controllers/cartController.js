const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  try {
    const requestedQty = Number(quantity);
    if (!Number.isFinite(requestedQty) || requestedQty <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const availableStock = Number.isFinite(Number(product.stock)) ? Math.floor(Number(product.stock)) : 0;
    if (availableStock < requestedQty) {
      return res.status(400).json({ message: 'Product out of stock' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existingIndex = cart.items.findIndex(i => i.product.toString() === productId);
    if (existingIndex >= 0) {
      const nextQuantity = cart.items[existingIndex].quantity + Math.floor(requestedQty);
      if (nextQuantity > availableStock) {
        return res.status(400).json({ message: 'Product out of stock' });
      }
      cart.items[existingIndex].quantity = nextQuantity;
    } else {
      cart.items.push({ product: productId, quantity: Math.floor(requestedQty), price: product.price });
    }
    cart.calculateTotal();
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  try {
    const requestedQty = Number(quantity);
    if (!Number.isFinite(requestedQty)) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(i => i._id.toString() === req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    if (requestedQty <= 0) {
      cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
    } else {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      const availableStock = Number.isFinite(Number(product.stock)) ? Math.floor(Number(product.stock)) : 0;
      if (availableStock < Math.floor(requestedQty)) {
        return res.status(400).json({ message: 'Product out of stock' });
      }

      item.quantity = Math.floor(requestedQty);
    }
    cart.calculateTotal();
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
    cart.calculateTotal();
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) { cart.items = []; cart.totalAmount = 0; await cart.save(); }
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
