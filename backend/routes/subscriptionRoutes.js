const express = require('express');
const router = express.Router();
const { activateSubscription } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/activate', activateSubscription);

module.exports = router;
