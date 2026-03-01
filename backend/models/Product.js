const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    required: true,
    enum: ['First Aid Kits', 'Fire Safety Equipment', 'Disaster Preparedness Kits', 'Personal Safety Devices']
  },
  image: { type: String, default: '' },
  stock: { type: Number, required: true, default: 0, min: 0 },
  rating: { type: Number, default: 4.0, min: 0, max: 5 },
  numReviews: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  brand: { type: String, default: '' },
  sku: { type: String, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
