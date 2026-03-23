const express = require('express');
const router = express.Router();
const { createProduct, updateProduct, deleteProduct, getLowStockProducts } = require('../controllers/productController');
const { getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { getDashboardStats, createTier, updateTier, deleteTier, createReward, updateReward, deleteReward } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const User = require('../models/User');
const InventoryAlert = require('../models/InventoryAlert');

router.use(protect, adminOnly);

// Product management
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/low-stock', getLowStockProducts);

// Order management
router.get('/stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Inventory alerts
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await InventoryAlert.find()
      .populate('product', 'name sku stock')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/alerts/:id/read', async (req, res) => {
  try {
    const alert = await InventoryAlert.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    ).populate('product', 'name sku stock');
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User management
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CRM Settings
router.post('/crm/tiers', createTier);
router.put('/crm/tiers/:id', updateTier);
router.delete('/crm/tiers/:id', deleteTier);

router.post('/crm/rewards', createReward);
router.put('/crm/rewards/:id', updateReward);
router.delete('/crm/rewards/:id', deleteReward);

module.exports = router;
