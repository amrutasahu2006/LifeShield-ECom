const Order = require('../models/Order');

exports.getDashboardStats = async (req, res) => {
  try {
    const summary = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: { $ifNull: ['$totalPrice', 0] } }
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

    const totals = summary[0] || { totalOrders: 0, totalRevenue: 0 };

    res.json({
      totalOrders: totals.totalOrders,
      totalRevenue: totals.totalRevenue,
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
