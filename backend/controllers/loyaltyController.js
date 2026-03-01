const User = require('../models/User');

const rewardCatalog = {
  '$5 Off Coupon': 500,
  'Free Expedited Shipping': 300,
  'Travel First Aid Kit (Free)': 2500,
  'Home Safety Checklist PDF': 100,
  'CPR Basics Online Course': 1000,
  'Upgrade to Platinum (1 mo)': 4000
};

const getTier = (points) => {
  if (points >= 5000) return 'Platinum';
  if (points >= 1500) return 'Gold';
  if (points >= 500) return 'Silver';
  return 'Bronze';
};

const getNextTierThreshold = (points) => {
  if (points < 500) return 500;
  if (points < 1500) return 1500;
  if (points < 5000) return 5000;
  return null;
};

exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name loyaltyPoints loyaltyActivity createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const tier = getTier(user.loyaltyPoints || 0);
    const nextTierThreshold = getNextTierThreshold(user.loyaltyPoints || 0);
    const pointsToNextTier = nextTierThreshold ? nextTierThreshold - user.loyaltyPoints : 0;

    const activity = [...(user.loyaltyActivity || [])]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 12);

    res.json({
      userName: user.name,
      points: user.loyaltyPoints || 0,
      memberSince: user.createdAt,
      tier,
      nextTierThreshold,
      pointsToNextTier,
      pointsValue: ((user.loyaltyPoints || 0) / 100).toFixed(2),
      activity,
      rewardCatalog
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.redeemReward = async (req, res) => {
  const { rewardName } = req.body;
  if (!rewardName || !rewardCatalog[rewardName]) {
    return res.status(400).json({ message: 'Invalid reward selected' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const requiredPoints = rewardCatalog[rewardName];
    if ((user.loyaltyPoints || 0) < requiredPoints) {
      return res.status(400).json({ message: `Not enough points. You need ${requiredPoints} points.` });
    }

    user.loyaltyPoints -= requiredPoints;
    user.loyaltyActivity.unshift({
      type: 'redeem',
      title: `Redeemed – ${rewardName}`,
      description: `Redeemed ${requiredPoints} points`,
      points: -requiredPoints,
      reference: 'Rewards Store'
    });

    await user.save();

    res.json({
      message: `${rewardName} redeemed successfully!`,
      redeemedReward: rewardName,
      pointsUsed: requiredPoints,
      remainingPoints: user.loyaltyPoints
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
