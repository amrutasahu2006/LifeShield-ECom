const User = require('../models/User');

const addSubscriptionDuration = (plan) => {
  const now = new Date();
  if (plan === 'monthly') {
    now.setMonth(now.getMonth() + 1);
    return now;
  }

  now.setFullYear(now.getFullYear() + 1);
  return now;
};

exports.activateSubscription = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid subscription plan selected' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.subscription = {
      isActive: true,
      plan,
      expiryDate: addSubscriptionDuration(plan)
    };

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      loyaltyPoints: updatedUser.loyaltyPoints || 0,
      subscription: updatedUser.subscription
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
