const twilio = require('twilio');

exports.sendSosAlert = async (req, res) => {
  try {
    const { latitude, longitude, emergencyPhone } = req.body;

    if (
      latitude === undefined ||
      longitude === undefined ||
      !emergencyPhone
    ) {
      return res.status(400).json({
        message: 'latitude, longitude, and emergencyPhone are required'
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ message: 'Invalid latitude or longitude' });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromPhone) {
      return res.status(500).json({ message: 'Twilio is not configured on the server' });
    }

    const client = twilio(accountSid, authToken);

    const smsBody = `LifeShield Alert: User needs help. Location: https://maps.google.com/?q=${lat},${lng}`;

    const twilioMessage = await client.messages.create({
      body: smsBody,
      from: fromPhone,
      to: emergencyPhone
    });

    return res.status(200).json({
      message: 'SOS alert sent successfully',
      sid: twilioMessage.sid
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to send SOS alert',
      error: error.message
    });
  }
};
