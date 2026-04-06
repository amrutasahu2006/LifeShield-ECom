const express = require('express');
const { createSharedKit, getSharedKitByShortId } = require('../controllers/kitController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createSharedKit);
router.get('/:shortId', getSharedKitByShortId);

module.exports = router;
