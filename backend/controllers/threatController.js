const express = require('express');

const router = express.Router();

const mockThreatApiResponse = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        hasAlert: false,
        weather: 'Clear skies',
        location: 'Local Area'
      });
    }, 800);
  });

router.get('/threat-alerts', async (req, res) => {
  try {
    const { lat, lon } = req.query || {};

    if (!lat || !lon) {
      return res.status(400).json({ message: 'lat and lon query parameters are required' });
    }

    const threatData = await mockThreatApiResponse();
    return res.json(threatData);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch threat alerts right now' });
  }
});

module.exports = router;
