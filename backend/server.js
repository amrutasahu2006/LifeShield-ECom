const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const http = require('http');
const Product = require('./models/Product');

dotenv.config({ override: true });

// Connect to database
connectDB();

const ensureCustomKitProduct = async () => {
  try {
    await Product.findOneAndUpdate(
      { sku: 'PULL-SCM-CUSTOM' },
      {
        $setOnInsert: {
          name: 'Custom Emergency Kit (Made-to-Order)',
          description: 'Build your own emergency kit with custom selected components.',
          price: 999,
          category: 'Disaster Preparedness Kits',
          stock: 999999,
          lowStockThreshold: 10,
          image: 'https://images.unsplash.com/photo-1612831455740-a2f6cb179db4?w=400',
          featured: true,
          rating: 5,
          numReviews: 0,
          brand: 'LifeShield Custom'
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    console.error('Failed to ensure custom kit product:', error.message);
  }
};

mongoose.connection.once('connected', () => {
  ensureCustomKitProduct();
});

const app = express();

// Middleware
app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/subscription', require('./routes/subscriptionRoutes'));
app.use('/api/loyalty', require('./routes/loyaltyRoutes'));
app.use('/api/trivia', require('./routes/triviaRoutes'));
app.use('/api', require('./controllers/threatController'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'LIFESHIELD API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`LIFESHIELD server running on port ${PORT}`));

const isExistingLifeshieldServerRunning = () => new Promise((resolve) => {
  const request = http.request(
    {
      hostname: '127.0.0.1',
      port: PORT,
      path: '/',
      method: 'GET',
      timeout: 1500
    },
    (response) => {
      let body = '';
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        resolve(response.statusCode === 200 && body.includes('LIFESHIELD API is running'));
      });
    }
  );

  request.on('error', () => resolve(false));
  request.on('timeout', () => {
    request.destroy();
    resolve(false);
  });
  request.end();
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    isExistingLifeshieldServerRunning().then((isRunning) => {
      if (isRunning) {
        console.log(`LIFESHIELD backend is already running on port ${PORT}.`);
        process.exit(0);
      }

      console.error(`Port ${PORT} is already in use by another process.`);
      console.error('Stop the existing process on this port or change PORT in backend/.env.');
      process.exit(1);
    });
    return;
  }

  console.error('Server startup error:', error.message);
  process.exit(1);
});
