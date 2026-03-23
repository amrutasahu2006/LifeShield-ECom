const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDashboard, redeemReward, getTiers, getRewards } = require('../controllers/loyaltyController');

router.get('/tiers', getTiers);
router.get('/rewards', getRewards);

router.use(protect);

router.get('/dashboard', getDashboard);
router.post('/redeem', redeemReward);

module.exports = router;
