const User = require('../models/User');
const Tier = require('../models/Tier');
const Reward = require('../models/Reward');

exports.getDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name loyaltyPoints loyaltyActivity createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Fetch dynamic tiers and sort ascending
    const tiers = await Tier.find().sort({ minPoints: 1 });
    const userPts = user.loyaltyPoints || 0;
    
    // Calculate current tier
    let currentTierName = 'Bronze';
    let nextTierThreshold = null;
    let pointsToNextTier = 0;

    if (tiers.length > 0) {
      // Current tier is the highest tier where minPoints <= userPts
      const activeTier = [...tiers].reverse().find(t => userPts >= t.minPoints) || tiers[0];
      currentTierName = activeTier.name;
      // Next tier is the first tier where minPoints > userPts
      const nextTier = tiers.find(t => t.minPoints > userPts);
      if (nextTier) {
        nextTierThreshold = nextTier.minPoints;
        pointsToNextTier = nextTierThreshold - userPts;
      }
    }

    const activity = [...(user.loyaltyActivity || [])]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 12);

    res.json({
      userName: user.name,
      points: userPts,
      memberSince: user.createdAt,
      tier: currentTierName,
      nextTierThreshold,
      pointsToNextTier,
      pointsValue: (userPts / 100).toFixed(2),
      activity
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.redeemReward = async (req, res) => {
  const { rewardName } = req.body;
  
  try {
    const reward = await Reward.findOne({ name: rewardName });
    if (!reward) {
      return res.status(400).json({ message: 'Invalid reward selected' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const requiredPoints = reward.points;
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

exports.getTiers = async (req, res) => {
  try {
    const tiers = await Tier.find().sort({ minPoints: 1 });
    res.json(tiers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find().sort({ points: 1 });
    res.json(rewards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
