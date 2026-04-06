const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { admin, isFirebaseAdminReady } = require('../config/firebaseAdmin');

const buildSafeUserResponse = (user, includeToken = false) => {
  const response = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    loyaltyPoints: user.loyaltyPoints || 0,
    subscription: user.subscription,
    safetyProfile: user.safetyProfile,
  }

  if (includeToken) {
    response.token = generateToken(user._id)
  }

  return response
}

const isPlainString = (value) => typeof value === 'string' && value.trim().length > 0

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'lifeshield_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;
  if (!isPlainString(name) || !isPlainString(email) || !isPlainString(password)) {
    return res.status(400).json({ message: 'Invalid registration payload' })
  }

  const normalizedEmail = String(email || '').trim().toLowerCase();
  try {
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name: name.trim(), email: normalizedEmail, password: password.trim() });
    res.status(201).json(buildSafeUserResponse(user, true));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  if (!isPlainString(email) || !isPlainString(password)) {
    return res.status(400).json({ message: 'Invalid login payload' })
  }

  const normalizedEmail = String(email || '').trim().toLowerCase();
  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await user.comparePassword(password.trim()))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json(buildSafeUserResponse(user, true));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { idToken, name, email, googleId, uid } = req.body || {};
    const providerUid = googleId || uid;
    const fallbackEmail = String(email || '').trim().toLowerCase();
    const fallbackName = String(name || '').trim();

    if (!idToken && (!fallbackEmail || !providerUid)) {
      return res.status(400).json({ message: 'Firebase ID token or Google profile data is required' });
    }

    if (idToken && !isFirebaseAdminReady()) {
      return res.status(500).json({
        message: 'Google auth is not configured on server. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.'
      });
    }

    const decoded = idToken ? await admin.auth().verifyIdToken(idToken) : null;
    const normalizedEmail = String(decoded?.email || fallbackEmail).trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Google account email is required' });
    }

    const displayName = decoded?.name || fallbackName || normalizedEmail.split('@')[0] || 'Google User';
    const firebaseUid = decoded?.uid || providerUid;
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name: displayName,
        email: normalizedEmail,
        password: `google_${firebaseUid || Date.now()}`,
        authProvider: 'google',
        firebaseUid
      });
    } else {
      let needsSave = false;
      if (user.authProvider !== 'google') {
        user.authProvider = 'google';
        needsSave = true;
      }
      if (!user.firebaseUid && firebaseUid) {
        user.firebaseUid = firebaseUid;
        needsSave = true;
      }
      if ((!user.name || user.name === user.email.split('@')[0]) && displayName) {
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
  res.json(buildSafeUserResponse(req.user));
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, address, safetyProfile, password } = req.body || {};

    if (typeof name === 'string' && name.trim()) {
      user.name = name.trim();
    }

    if (address && typeof address === 'object' && !Array.isArray(address)) {
      user.address = {
        street: typeof address.street === 'string' ? address.street.trim() : user.address?.street,
        city: typeof address.city === 'string' ? address.city.trim() : user.address?.city,
        state: typeof address.state === 'string' ? address.state.trim() : user.address?.state,
        zip: typeof address.zip === 'string' ? address.zip.trim() : user.address?.zip,
        country: typeof address.country === 'string' ? address.country.trim() : user.address?.country,
      }
    }

    if (safetyProfile && typeof safetyProfile === 'object' && !Array.isArray(safetyProfile)) {
      user.safetyProfile = {
        ...user.safetyProfile,
        region: typeof safetyProfile.region === 'string' ? safetyProfile.region.trim() : user.safetyProfile?.region,
        householdSize: typeof safetyProfile.householdSize === 'string' ? safetyProfile.householdSize.trim() : user.safetyProfile?.householdSize,
        homeType: typeof safetyProfile.homeType === 'string' ? safetyProfile.homeType.trim() : user.safetyProfile?.homeType,
        needs: Array.isArray(safetyProfile.needs) ? safetyProfile.needs.filter((item) => typeof item === 'string').map((item) => item.trim()) : user.safetyProfile?.needs,
        risks: Array.isArray(safetyProfile.risks) ? safetyProfile.risks.filter((item) => typeof item === 'string').map((item) => item.trim()) : user.safetyProfile?.risks,
      }
    }

    if (typeof password === 'string' && password.trim()) user.password = password.trim();

    const updated = await user.save();
    res.json(buildSafeUserResponse(updated, true));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
