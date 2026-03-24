const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { admin, isFirebaseAdminReady } = require('../config/firebaseAdmin');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'lifeshield_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  try {
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email: normalizedEmail, password });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      loyaltyPoints: user.loyaltyPoints || 0,
      subscription: user.subscription,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      loyaltyPoints: user.loyaltyPoints || 0,
      subscription: user.subscription,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required' });
    }

    if (!isFirebaseAdminReady()) {
      return res.status(500).json({
        message: 'Google auth is not configured on server. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.'
      });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const normalizedEmail = String(decoded.email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Google account email is required' });
    }

    const displayName = decoded.name || normalizedEmail.split('@')[0] || 'Google User';
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name: displayName,
        email: normalizedEmail,
        password: `google_${decoded.uid}_${Date.now()}`,
        authProvider: 'google',
        firebaseUid: decoded.uid
      });
    } else {
      let needsSave = false;
      if (user.authProvider !== 'google') {
        user.authProvider = 'google';
        needsSave = true;
      }
      if (!user.firebaseUid) {
        user.firebaseUid = decoded.uid;
        needsSave = true;
      }
      if (!user.name && displayName) {
        user.name = displayName;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints || 0,
      subscription: user.subscription,
      token: generateToken(user._id)
    });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid Google authentication token' });
  }
};

exports.getProfile = async (req, res) => {
  res.json(req.user);
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.name = req.body.name || user.name;
    user.address = req.body.address || user.address;
    user.safetyProfile = req.body.safetyProfile || user.safetyProfile;
    if (req.body.password) user.password = req.body.password;
    const updated = await user.save();
    res.json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role, loyaltyPoints: updated.loyaltyPoints || 0, safetyProfile: updated.safetyProfile, subscription: updated.subscription, token: generateToken(updated._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
