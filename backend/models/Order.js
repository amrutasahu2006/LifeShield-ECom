const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  image: String,
  customComponents: [{ type: String }]
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: { type: String, default: 'Card (Demo)' },
  paymentResult: {
    id: String,
    status: String,
    update_time: String
  },
  itemsPrice: { type: Number, required: true },
  shippingPrice: { type: Number, default: 0 },
  taxPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  processedAt: Date,
  shippedAt: Date,
  isDelivered: { type: Boolean, default: false },
  deliveredAt: Date,
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered'],
    default: 'pending'
  }
}, { timestamps: true });

orderSchema.pre('save', function (next) {
  if (!this.status) {
    this.status = 'pending';
  }

  if (this.status === 'processing' && !this.processedAt) {
    this.processedAt = new Date();
  }
  if (this.status === 'shipped' && !this.shippedAt) {
    this.shippedAt = new Date();
  }
  if (this.status === 'delivered' && !this.deliveredAt) {
    this.deliveredAt = new Date();
    this.isDelivered = true;
  }

  next();
});

module.exports = mongoose.model('Order', orderSchema);
