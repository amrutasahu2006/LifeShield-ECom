const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true },
  password: { type: String, required: [true, 'Password is required'], minlength: 6 },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  firebaseUid: { type: String, default: null },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  loyaltyPoints: { type: Number, default: 0, min: 0 },
  shieldPoints: { type: Number, default: 0, min: 0 },
  lastTriviaDate: { type: Date, default: null },
  pointHistory: [
    {
      action: { type: String, required: true },
      points: { type: String, required: true },
      type: { type: String, enum: ['earn', 'redeem', 'bonus'], default: 'earn' },
      date: { type: Date, default: Date.now }
    }
  ],
  loyaltyActivity: [
    {
      type: { type: String, enum: ['earn', 'redeem', 'bonus'], default: 'earn' },
      title: { type: String, required: true },
      description: { type: String, default: '' },
      points: { type: Number, required: true },
      reference: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  safetyProfile: {
    region: { type: String, default: 'California (High Wildfire + Earthquake Risk)' },
    householdSize: { type: String, default: 'Family of 4' },
    homeType: { type: String, default: 'Single-Family Home' },
    needs: { type: [String], default: [] },
    risks: { type: [String], default: [] },
    alertPreferences: {
      wildfire: { type: Boolean, default: true },
      flooding: { type: Boolean, default: true },
      expiry: { type: Boolean, default: true },
      webinars: { type: Boolean, default: false },
      sales: { type: Boolean, default: true }
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  subscription: {
    isActive: { type: Boolean, default: false },
    plan: {
      type: String,
      default: null,
      validate: {
        validator: (value) => value === null || ['monthly', 'yearly'].includes(value),
        message: 'subscription.plan must be monthly, yearly, or null'
      }
    },
    expiryDate: { type: Date, default: null }
  }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
