const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDashboard, redeemReward } = require('../controllers/loyaltyController');

router.use(protect);

router.get('/dashboard', getDashboard);
router.post('/redeem', redeemReward);

module.exports = router;
