const crypto = require('crypto');
const getRazorpayClient = require('../config/razorpay');
const {
  createPaymentVerificationToken,
  normalizeAmount
} = require('../utils/paymentVerification');

exports.createOrder = async (req, res) => {
  try {
    const razorpay = getRazorpayClient();

    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const amountInPaise = Math.round(amount * 100);
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const razorpay = getRazorpayClient();

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification details' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
    const amount = normalizeAmount((razorpayOrder.amount || 0) / 100);

    const verifiedPayment = {
      token: createPaymentVerificationToken({
        userId: req.user._id.toString(),
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        amount
      }),
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      amount
    };

    res.json({ success: true, verifiedPayment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
