const express = require('express');
const router = express.Router();
const { getProducts, getFeaturedProducts, getProductById, getScmTransparencyStats } = require('../controllers/productController');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/scm-transparency', getScmTransparencyStats);
router.get('/:id', getProductById);

module.exports = router;
