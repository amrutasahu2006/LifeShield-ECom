const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String, required: true },
  points: { type: Number, required: true, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Reward', rewardSchema);
