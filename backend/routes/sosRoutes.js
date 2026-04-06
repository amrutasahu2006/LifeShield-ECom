const express = require('express');
const { sendSosAlert } = require('../controllers/sosController');

const router = express.Router();

router.post('/', sendSosAlert);

module.exports = router;
