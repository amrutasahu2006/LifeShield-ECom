const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config();

const User = require('./models/User');
const Product = require('./models/Product');

const products = [
  {
    name: 'Professional 326-Piece First Aid Kit',
    description: 'Comprehensive first aid kit ideal for home, office, and outdoor use. Includes bandages, gauze, antiseptic wipes, CPR mask, scissors, tweezers, medical tape, and emergency thermal blanket. OSHA compliant.',
    price: 49.99, category: 'First Aid Kits', stock: 85,
    image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400',
    featured: true, rating: 4.8, numReviews: 234, brand: 'MediGuard Pro', sku: 'FAK-001'
  },
  {
    name: 'Compact Travel First Aid Kit',
    description: 'Portable 80-piece first aid kit in a waterproof case. Perfect for hiking, camping, and travel. Lightweight and compact design fits easily in a backpack.',
    price: 24.99, category: 'First Aid Kits', stock: 120,
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400',
    featured: false, rating: 4.5, numReviews: 189, brand: 'TrailSafe', sku: 'FAK-002'
  },
  {
    name: 'Trauma & Bleeding Control Kit',
    description: 'Advanced trauma kit with tourniquets, hemostatic gauze, pressure bandages, chest seals, and nasopharyngeal airway. Designed for serious emergencies and mass casualty events.',
    price: 89.99, category: 'First Aid Kits', stock: 45,
    image: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=400',
    featured: true, rating: 4.9, numReviews: 98, brand: 'TacMed', sku: 'FAK-003'
  },
  {
    name: 'ABC Dry Powder Fire Extinguisher 2.5 lbs',
    description: 'UL-listed 2.5 lb ABC dry chemical fire extinguisher. Effective against Class A (wood/paper), Class B (liquids), and Class C (electrical) fires. Wall-mount bracket included.',
    price: 39.99, category: 'Fire Safety Equipment', stock: 60,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    featured: true, rating: 4.7, numReviews: 312, brand: 'FireShield', sku: 'FSE-001'
  },
  {
    name: 'Kidde Smoke & Carbon Monoxide Detector',
    description: 'Dual-sensor combination alarm detects both smoke and carbon monoxide. 10-year sealed battery, voice alert, and digital CO display. NFPA recommended.',
    price: 54.99, category: 'Fire Safety Equipment', stock: 95,
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
    featured: true, rating: 4.6, numReviews: 421, brand: 'SafeAlert', sku: 'FSE-002'
  },
  {
    name: 'Fire Escape Ladder – 2 Story (15 ft)',
    description: 'Emergency escape ladder for 2-story windows. 15-foot steel chain ladder with anti-slip rungs. Supports up to 1000 lbs. Mounts quickly without tools. Compact storage bag included.',
    price: 64.99, category: 'Fire Safety Equipment', stock: 38,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
    featured: false, rating: 4.4, numReviews: 87, brand: 'EscapeFirst', sku: 'FSE-003'
  },
  {
    name: 'Fire Blanket Emergency Suppression Kit',
    description: 'Heavy-duty fiberglass fire suppression blanket. Smothers small fires quickly without chemicals. Reusable in non-fire situations. Ideal for kitchen, garage, and vehicles.',
    price: 19.99, category: 'Fire Safety Equipment', stock: 150,
    image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400',
    featured: false, rating: 4.3, numReviews: 156, brand: 'BlazeStopper', sku: 'FSE-004'
  },
  {
    name: '72-Hour Emergency Survival Kit (4 Person)',
    description: 'Complete 72-hour survival kit for a family of 4. Includes 4-day food rations, 4 liters of water, hand-crank radio, flashlight, emergency blankets, dust masks, work gloves, and first aid kit.',
    price: 149.99, category: 'Disaster Preparedness Kits', stock: 30,
    image: 'https://images.unsplash.com/photo-1624704577884-7a52fd8a89db?w=400',
    featured: true, rating: 4.9, numReviews: 267, brand: 'ReadyNow', sku: 'DPK-001'
  },
  {
    name: 'Bug-Out Bag 72-Hour Backpack Kit',
    description: 'Ready-to-go evacuation backpack with 100+ emergency supplies. Includes water filtration, food bars, paracord, multi-tool, emergency poncho, signal mirror, and waterproof documents bag.',
    price: 129.99, category: 'Disaster Preparedness Kits', stock: 25,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    featured: false, rating: 4.7, numReviews: 198, brand: 'SurviveReady', sku: 'DPK-002'
  },
  {
    name: 'Emergency Water Filtration System',
    description: 'Portable water purifier filters up to 100,000 gallons. Removes 99.9999% of bacteria and protozoa. No batteries needed. Perfect for emergency preparedness and outdoor adventures.',
    price: 34.99, category: 'Disaster Preparedness Kits', stock: 75,
    image: 'https://images.unsplash.com/photo-1548048026-5a1a941d93d3?w=400',
    featured: false, rating: 4.8, numReviews: 345, brand: 'AquaShield', sku: 'DPK-003'
  },
  {
    name: 'Hand Crank Emergency Weather Radio',
    description: 'NOAA weather radio with AM/FM, solar and hand-crank charging, LED flashlight, SOS alarm, and USB phone charger. Waterproof and shock-resistant case.',
    price: 45.99, category: 'Disaster Preparedness Kits', stock: 55,
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400',
    featured: true, rating: 4.6, numReviews: 223, brand: 'AlertStation', sku: 'DPK-004'
  },
  {
    name: 'Personal Safety Alarm Keychain (130dB)',
    description: 'Loud 130dB personal alarm with LED strobe light. Easy pull-pin activation. Compact and lightweight for women, children, students, and the elderly. Water-resistant.',
    price: 14.99, category: 'Personal Safety Devices', stock: 200,
    image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400',
    featured: true, rating: 4.5, numReviews: 678, brand: 'SafeSound', sku: 'PSD-001'
  },
  {
    name: 'Tactical Pepper Spray Defense Kit',
    description: 'Police-strength pepper spray with UV dye, 12-foot range, and 35 bursts. Includes flip-top safety cap and keychain clip. Effective for up to 4 years.',
    price: 22.99, category: 'Personal Safety Devices', stock: 110,
    image: 'https://images.unsplash.com/photo-1617450365226-9bf28c04e130?w=400',
    featured: false, rating: 4.4, numReviews: 412, brand: 'DefendRight', sku: 'PSD-002'
  },
  {
    name: 'GPS Personal Emergency Locator Beacon',
    description: 'Satellite GPS emergency locator beacon for hikers, boaters, and adventurers. Sends distress signal to rescue services with your exact GPS coordinates. No subscription required.',
    price: 299.99, category: 'Personal Safety Devices', stock: 20,
    image: 'https://images.unsplash.com/photo-1516707421ied3?w=400',
    featured: true, rating: 4.8, numReviews: 89, brand: 'BeaconSafe', sku: 'PSD-003'
  },
  {
    name: 'Reflective Safety Vest & Whistle Kit',
    description: 'High-visibility reflective safety vest with 360° reflectivity, ANSI Class 2 certified. Includes emergency whistle and multiple pockets. Fits sizes S to 3XL.',
    price: 18.99, category: 'Personal Safety Devices', stock: 180,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    featured: false, rating: 4.2, numReviews: 134, brand: 'SafeVis', sku: 'PSD-004'
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lifeshield');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany();
    await User.deleteMany();
    console.log('Cleared existing data');

    // Insert products
    await Product.insertMany(products);
    console.log(`Inserted ${products.length} products`);

    // Create admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@lifeshield.com',
      password: 'admin123',
      role: 'admin'
    });

    // Create test user
    await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'user'
    });

    console.log('Created admin (admin@lifeshield.com / admin123) and test user (john@example.com / password123)');
    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedDB();
