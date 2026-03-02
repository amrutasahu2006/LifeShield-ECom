const mongoose = require('mongoose');

const inventoryAlertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['low_stock'],
    default: 'low_stock'
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  threshold: {
    type: Number,
    required: true,
    default: 20
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('InventoryAlert', inventoryAlertSchema);
