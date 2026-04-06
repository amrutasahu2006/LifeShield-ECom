const mongoose = require('mongoose');
const crypto = require('crypto');

const SHORT_ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const generateShortId = (length = 6) => {
  const randomBytes = crypto.randomBytes(length);
  let shortId = '';

  for (let i = 0; i < length; i += 1) {
    shortId += SHORT_ID_ALPHABET[randomBytes[i] % SHORT_ID_ALPHABET.length];
  }

  return shortId;
};

const sharedKitSchema = new mongoose.Schema(
  {
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    shortId: {
      type: String,
      required: true,
      unique: true,
      minlength: 6,
      maxlength: 6,
      default: () => generateShortId(6)
    },
    kitDetails: {
      type: [String],
      default: []
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ]
  },
  { timestamps: true }
);

sharedKitSchema.index({ shortId: 1 }, { unique: true });

module.exports = mongoose.model('SharedKit', sharedKitSchema);
