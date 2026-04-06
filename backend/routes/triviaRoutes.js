const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.post('/reward', async (req, res) => {
  try {
    const { userId } = req.body || {};
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Atomic guard: this update can only match once per user per day.
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        $or: [
          { lastTriviaDate: { $lt: startOfToday } },
          { lastTriviaDate: { $exists: false } },
          { lastTriviaDate: null }
        ]
      },
      {
        $inc: { shieldPoints: 50 },
        $set: { lastTriviaDate: new Date() },
        $push: {
          pointHistory: {
            action: 'Daily Safety Trivia Winner',
            points: '+50',
            type: 'earn',
            date: new Date()
          }
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      const existingUser = await User.findById(userId).select('_id');
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(400).json({ message: 'You have already played today. Come back tomorrow!' });
    }

    return res.status(200).json({
      success: true,
      message: 'ShieldPoints rewarded successfully'
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to process trivia reward' });
  }
});

module.exports = router;