const mongoose = require('mongoose');
const SharedKit = require('../models/SharedKit');

const MAX_SHORT_ID_GENERATION_ATTEMPTS = 5;

const isDuplicateShortIdError = (error) => (
  Boolean(error && error.code === 11000 && error.keyPattern && error.keyPattern.shortId)
);

exports.createSharedKit = async (req, res) => {
  try {
    const {
      products = [],
      kitDetails = [],
      referrerId: bodyReferrerId,
      userId
    } = req.body;

    const normalizedKitDetails = Array.isArray(kitDetails)
      ? kitDetails
        .filter((entry) => typeof entry === 'string')
        .map((entry) => entry.trim())
        .filter(Boolean)
      : [];

    const hasProducts = Array.isArray(products) && products.length > 0;
    const hasKitDetails = normalizedKitDetails.length > 0;

    if (!hasProducts && !hasKitDetails) {
      return res.status(400).json({
        message: 'Provide at least one product ID or one kitDetails item'
      });
    }

    if (hasProducts) {
      const hasInvalidProductId = products.some((productId) => !mongoose.Types.ObjectId.isValid(productId));
      if (hasInvalidProductId) {
        return res.status(400).json({ message: 'One or more product IDs are invalid' });
      }
    }

    const referrerId = req.user?._id || userId || bodyReferrerId;
    if (!referrerId || !mongoose.Types.ObjectId.isValid(referrerId)) {
      return res.status(400).json({ message: 'A valid referrerId is required' });
    }

    let sharedKit;
    for (let attempt = 0; attempt < MAX_SHORT_ID_GENERATION_ATTEMPTS; attempt += 1) {
      try {
        sharedKit = await SharedKit.create({
          referrerId,
          products: hasProducts ? products : [],
          kitDetails: normalizedKitDetails
        });
        break;
      } catch (error) {
        if (!isDuplicateShortIdError(error) || attempt === MAX_SHORT_ID_GENERATION_ATTEMPTS - 1) {
          throw error;
        }
      }
    }

    const frontendBaseUrl =
      process.env.FRONTEND_BASE_URL ||
      `${req.protocol}://${req.get('host')}`;
    const shortLinkUrl = `${frontendBaseUrl.replace(/\/$/, '')}/kit/${sharedKit.shortId}`;

    return res.status(201).json({
      message: 'Shared kit created successfully',
      shortId: sharedKit.shortId,
      shortLinkUrl,
      referrerId: sharedKit.referrerId,
      kitDetails: sharedKit.kitDetails
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getSharedKitByShortId = async (req, res) => {
  try {
    const { shortId } = req.params;

    if (!shortId || shortId.length !== 6) {
      return res.status(400).json({ message: 'shortId must be a 6-character value' });
    }

    const sharedKit = await SharedKit.findOne({ shortId })
      .populate({
        path: 'products',
        select: 'name description price category image stock rating numReviews'
      })
      .select('shortId referrerId products kitDetails createdAt updatedAt');

    if (!sharedKit) {
      return res.status(404).json({ message: 'Shared kit not found' });
    }

    return res.json(sharedKit);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
