const mongoose = require('mongoose');

const tierSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String, required: true },
  color: { type: String, required: true },
  bg: { type: String, required: true },
  range: { type: String, required: true },
  minPoints: { type: Number, required: true },
  pct: { type: String, required: true },
  label: { type: String, required: true },
  perks: { type: [String], required: true },
  goal: { type: String, required: true },
  popular: { type: Boolean, default: false }
}, { timestamps: true });

// Ensure ascending order by points when fetching
tierSchema.index({ minPoints: 1 });

module.exports = mongoose.model('Tier', tierSchema);
