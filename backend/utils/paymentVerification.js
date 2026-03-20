const crypto = require('crypto');

const getVerificationSecret = () =>
  process.env.PAYMENT_VERIFICATION_SECRET ||
  process.env.JWT_SECRET ||
  'lifeshield_payment_verification_secret';

const normalizeAmount = (amount) => Number(Number(amount).toFixed(2));

const createPaymentVerificationToken = ({ userId, razorpayOrderId, razorpayPaymentId, amount }) => {
  const payload = `${userId}|${razorpayOrderId}|${razorpayPaymentId}|${normalizeAmount(amount)}`;
  return crypto.createHmac('sha256', getVerificationSecret()).update(payload).digest('hex');
};

const isPaymentVerificationValid = ({ token, userId, razorpayOrderId, razorpayPaymentId, amount }) => {
  if (!token) return false;

  const expected = createPaymentVerificationToken({
    userId,
    razorpayOrderId,
    razorpayPaymentId,
    amount
  });

  if (token.length !== expected.length) return false;

  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
};

module.exports = {
  createPaymentVerificationToken,
  isPaymentVerificationValid,
  normalizeAmount
};
