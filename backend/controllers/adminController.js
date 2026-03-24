const Order = require('../models/Order');
const Tier = require('../models/Tier');
const Reward = require('../models/Reward');

const parsedCommissionRate = Number(process.env.PLATFORM_COMMISSION_RATE);
const PLATFORM_COMMISSION_RATE = Number.isFinite(parsedCommissionRate) && parsedCommissionRate >= 0
  ? parsedCommissionRate
  : 0.1;

exports.getDashboardStats = async (req, res) => {
  try {
    const summary = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: { $ifNull: ['$totalPrice', 0] } },
          totalPlatformRevenue: {
            $sum: {
              $cond: [
                { $gt: [{ $ifNull: ['$platformFee', 0] }, 0] },
                { $ifNull: ['$platformFee', 0] },
                {
                  $multiply: [
                    { $ifNull: ['$totalPrice', 0] },
                    PLATFORM_COMMISSION_RATE
                  ]
                }
              ]
            }
          }
        }
      }
    ]);

    const monthlyRevenue = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalRevenue: { $sum: { $ifNull: ['$totalPrice', 0] } },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const topSellingProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          quantitySold: { $sum: { $ifNull: ['$items.quantity', 0] } },
          revenue: {
            $sum: {
              $multiply: [
                { $ifNull: ['$items.quantity', 0] },
                { $ifNull: ['$items.price', 0] }
              ]
            }
          }
        }
      },
      { $sort: { quantitySold: -1, revenue: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          name: 1,
          quantitySold: 1,
          revenue: 1
        }
      }
    ]);

    const totals = summary[0] || { totalOrders: 0, totalRevenue: 0, totalPlatformRevenue: 0 };

    res.json({
      totalOrders: totals.totalOrders,
      totalRevenue: totals.totalRevenue,
      totalPlatformRevenue: totals.totalPlatformRevenue,
      monthlyRevenue: monthlyRevenue.map((row) => ({
        year: row._id.year,
        month: row._id.month,
        totalRevenue: row.totalRevenue,
        totalOrders: row.totalOrders
      })),
      topSellingProducts
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CRM Tiers CRUD
exports.createTier = async (req, res) => {
  try {
    const tier = await Tier.create(req.body);
    res.status(201).json(tier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.updateTier = async (req, res) => {
  try {
    const tier = await Tier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!tier) return res.status(404).json({ message: 'Tier not found' });
    res.json(tier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.deleteTier = async (req, res) => {
  try {
    const tier = await Tier.findByIdAndDelete(req.params.id);
    if (!tier) return res.status(404).json({ message: 'Tier not found' });
    res.json({ message: 'Tier removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CRM Rewards CRUD
exports.createReward = async (req, res) => {
  try {
    const reward = await Reward.create(req.body);
    res.status(201).json(reward);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.updateReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!reward) return res.status(404).json({ message: 'Reward not found' });
    res.json(reward);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.deleteReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndDelete(req.params.id);
    if (!reward) return res.status(404).json({ message: 'Reward not found' });
    res.json({ message: 'Reward removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
