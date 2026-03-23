const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config({ override: true });

const User = require('./models/User');
const Product = require('./models/Product');
const Tier = require('./models/Tier');
const Reward = require('./models/Reward');

const products = [
  {
    name: 'Professional 326-Piece First Aid Kit',
    description: 'Comprehensive first aid kit ideal for home, office, and outdoor use. Includes bandages, gauze, antiseptic wipes, CPR mask, scissors, tweezers, medical tape, and emergency thermal blanket. OSHA compliant.',
    price: 3999, category: 'First Aid Kits', stock: 85,
    image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400',
    featured: true, rating: 4.8, numReviews: 234, brand: 'MediGuard Pro', sku: 'FAK-001'
  },
  {
    name: 'Compact Travel First Aid Kit',
    description: 'Portable 80-piece first aid kit in a waterproof case. Perfect for hiking, camping, and travel. Lightweight and compact design fits easily in a backpack.',
    price: 1999, category: 'First Aid Kits', stock: 120,
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400',
    featured: false, rating: 4.5, numReviews: 189, brand: 'TrailSafe', sku: 'FAK-002'
  },
  {
    name: 'Trauma & Bleeding Control Kit',
    description: 'Advanced trauma kit with tourniquets, hemostatic gauze, pressure bandages, chest seals, and nasopharyngeal airway. Designed for serious emergencies and mass casualty events.',
    price: 7499, category: 'First Aid Kits', stock: 45,
    image: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=400',
    featured: true, rating: 4.9, numReviews: 98, brand: 'TacMed', sku: 'FAK-003'
  },
  {
    name: 'ABC Dry Powder Fire Extinguisher 2.5 lbs',
    description: 'UL-listed 2.5 lb ABC dry chemical fire extinguisher. Effective against Class A (wood/paper), Class B (liquids), and Class C (electrical) fires. Wall-mount bracket included.',
    price: 3299, category: 'Fire Safety Equipment', stock: 60,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    featured: true, rating: 4.7, numReviews: 312, brand: 'FireShield', sku: 'FSE-001'
  },
  {
    name: 'Kidde Smoke & Carbon Monoxide Detector',
    description: 'Dual-sensor combination alarm detects both smoke and carbon monoxide. 10-year sealed battery, voice alert, and digital CO display. NFPA recommended.',
    price: 4499, category: 'Fire Safety Equipment', stock: 95,
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
    featured: true, rating: 4.6, numReviews: 421, brand: 'SafeAlert', sku: 'FSE-002'
  },
  {
    name: 'Fire Escape Ladder – 2 Story (15 ft)',
    description: 'Emergency escape ladder for 2-story windows. 15-foot steel chain ladder with anti-slip rungs. Supports up to 1000 lbs. Mounts quickly without tools. Compact storage bag included.',
    price: 5299, category: 'Fire Safety Equipment', stock: 38,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400',
    featured: false, rating: 4.4, numReviews: 87, brand: 'EscapeFirst', sku: 'FSE-003'
  },
  {
    name: 'Fire Blanket Emergency Suppression Kit',
    description: 'Heavy-duty fiberglass fire suppression blanket. Smothers small fires quickly without chemicals. Reusable in non-fire situations. Ideal for kitchen, garage, and vehicles.',
    price: 1499, category: 'Fire Safety Equipment', stock: 150,
    image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400',
    featured: false, rating: 4.3, numReviews: 156, brand: 'BlazeStopper', sku: 'FSE-004'
  },
  {
    name: '72-Hour Emergency Survival Kit (4 Person)',
    description: 'Complete 72-hour survival kit for a family of 4. Includes 4-day food rations, 4 liters of water, hand-crank radio, flashlight, emergency blankets, dust masks, work gloves, and first aid kit.',
    price: 12499, category: 'Disaster Preparedness Kits', stock: 30,
    image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80',
    featured: true, rating: 4.9, numReviews: 267, brand: 'ReadyNow', sku: 'DPK-001'
  },
  {
    name: 'Bug-Out Bag 72-Hour Backpack Kit',
    description: 'Ready-to-go evacuation backpack with 100+ emergency supplies. Includes water filtration, food bars, paracord, multi-tool, emergency poncho, signal mirror, and waterproof documents bag.',
    price: 10999, category: 'Disaster Preparedness Kits', stock: 25,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    featured: false, rating: 4.7, numReviews: 198, brand: 'SurviveReady', sku: 'DPK-002'
  },
  {
    name: 'Emergency Water Filtration System',
    description: 'Portable water purifier filters up to 100,000 gallons. Removes 99.9999% of bacteria and protozoa. No batteries needed. Perfect for emergency preparedness and outdoor adventures.',
    price: 2899, category: 'Disaster Preparedness Kits', stock: 75,
    image: 'https://images.unsplash.com/photo-1548048026-5a1a941d93d3?w=400',
    featured: false, rating: 4.8, numReviews: 345, brand: 'AquaShield', sku: 'DPK-003'
  },
  {
    name: 'Hand Crank Emergency Weather Radio',
    description: 'NOAA weather radio with AM/FM, solar and hand-crank charging, LED flashlight, SOS alarm, and USB phone charger. Waterproof and shock-resistant case.',
    price: 3799, category: 'Disaster Preparedness Kits', stock: 55,
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400',
    featured: true, rating: 4.6, numReviews: 223, brand: 'AlertStation', sku: 'DPK-004'
  },
  {
    name: 'Personal Safety Alarm Keychain (130dB)',
    description: 'Loud 130dB personal alarm with LED strobe light. Easy pull-pin activation. Compact and lightweight for women, children, students, and the elderly. Water-resistant.',
    price: 1199, category: 'Personal Safety Devices', stock: 200,
    image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400',
    featured: true, rating: 4.5, numReviews: 678, brand: 'SafeSound', sku: 'PSD-001'
  },
  {
    name: 'Tactical Pepper Spray Defense Kit',
    description: 'Police-strength pepper spray with UV dye, 12-foot range, and 35 bursts. Includes flip-top safety cap and keychain clip. Effective for up to 4 years.',
    price: 1799, category: 'Personal Safety Devices', stock: 110,
    image: 'https://images.unsplash.com/photo-1617450365226-9bf28c04e130?w=400',
    featured: false, rating: 4.4, numReviews: 412, brand: 'DefendRight', sku: 'PSD-002'
  },
  {
    name: 'GPS Personal Emergency Locator Beacon',
    description: 'Satellite GPS emergency locator beacon for hikers, boaters, and adventurers. Sends distress signal to rescue services with your exact GPS coordinates. No subscription required.',
    price: 24999, category: 'Personal Safety Devices', stock: 20,
    image: 'https://images.unsplash.com/photo-1529078155058-5d716f45d604?auto=format&fit=crop&w=800&q=80',
    featured: true, rating: 4.8, numReviews: 89, brand: 'BeaconSafe', sku: 'PSD-003'
  },
  {
    name: 'Reflective Safety Vest & Whistle Kit',
    description: 'High-visibility reflective safety vest with 360° reflectivity, ANSI Class 2 certified. Includes emergency whistle and multiple pockets. Fits sizes S to 3XL.',
    price: 1499, category: 'Personal Safety Devices', stock: 180,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    featured: false, rating: 4.2, numReviews: 134, brand: 'SafeVis', sku: 'PSD-004'
  },
  {
    name: 'Custom Emergency Kit (Made-to-Order)',
    description: 'Build your own bespoke emergency kit. Select from high-quality medical supplies, survival tools, and rations to construct a kit perfectly tailored to your family\'s unique risk profile.',
    price: 999, category: 'Disaster Preparedness Kits', stock: 999999,
    image: 'https://images.unsplash.com/photo-1612831455740-a2f6cb179db4?w=400',
    featured: true, rating: 5.0, numReviews: 142, brand: 'LifeShield Custom', sku: 'PULL-SCM-CUSTOM'
  }
];

const tiers = [
  { name: 'Bronze', icon: '🥉', color: '#cd7f32', bg: '#cd7f3215', range: '0 – 499 Points', minPoints: 0, pct: '1%', label: 'Points per Rs. 1', perks: ['Birthday bonus points (50 pts)', 'Member-only email alerts', 'Early access to sales', 'Free shipping over Rs. 75'], goal: 'Onboard & Activate', popular: false },
  { name: 'Silver', icon: '🥈', color: '#9ca3af', bg: '#9ca3af15', range: '500 – 1,499 Points', minPoints: 500, pct: '2%', label: 'Points per Rs. 1', perks: ['All Bronze benefits', 'Free shipping over Rs. 50', 'Priority customer support', 'Quarterly safety newsletter'], goal: 'Increase Frequency', popular: false },
  { name: 'Gold', icon: '🥇', color: '#f59e0b', bg: '#f59e0b15', range: '1,500 – 4,999 Points', minPoints: 1500, pct: '3%', label: 'Points per Rs. 1', perks: ['All Silver benefits', 'Always free shipping', 'Exclusive Gold-only products', 'Emergency prep webinars (free)'], goal: 'Maximize Spend', popular: true },
  { name: 'Platinum', icon: '💎', color: '#7c3aed', bg: '#7c3aed15', range: '5,000+ Points', minPoints: 5000, pct: '5%', label: 'Points per Rs. 1', perks: ['All Gold benefits', 'Dedicated Safety Advisor', 'Priority 24hr shipping', 'Annual home safety audit'], goal: 'Lock In & Upsell', popular: false }
];

const rewards = [
  { icon: '💰', name: 'Rs. 5 Off Coupon', points: 500 },
  { icon: '🚚', name: 'Free Expedited Shipping', points: 300 },
  { icon: '🩺', name: 'Travel First Aid Kit (Free)', points: 2500 },
  { icon: '📋', name: 'Home Safety Checklist PDF', points: 100 },
  { icon: '🎓', name: 'CPR Basics Online Course', points: 1000 },
  { icon: '💎', name: 'Upgrade to Platinum (1 mo)', points: 4000 }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lifeshield');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany();
    await User.deleteMany();
    await Tier.deleteMany();
    await Reward.deleteMany();
    console.log('Cleared existing data');

    // Insert products, tiers, and rewards
    await Product.insertMany(products);
    await Tier.insertMany(tiers);
    await Reward.insertMany(rewards);
    console.log(`Inserted ${products.length} products, ${tiers.length} tiers, and ${rewards.length} rewards`);

    // Create admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@lifeshield.com',
      password: 'admin123',
      role: 'admin',
      loyaltyPoints: 980,
      loyaltyActivity: [
        {
          type: 'bonus',
          title: 'Admin Welcome Bonus',
          description: 'Initial loyalty credit for admin testing',
          points: 980,
          reference: 'seed'
        }
      ]
    });

    // Create test user
    await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'user',
      loyaltyPoints: 2340,
      loyaltyActivity: [
        {
          type: 'earn',
          title: 'Purchase – 72-Hour Emergency Kit',
          description: 'Order #A3F2B9',
          points: 12499,
          reference: 'A3F2B9'
        },
        {
          type: 'earn',
          title: 'Purchase – First Aid Kit (326-Piece)',
          description: 'Order #A1D8F5',
          points: 3999,
          reference: 'A1D8F5'
        },
        {
          type: 'redeem',
          title: 'Redeemed – Rs. 5 Off Coupon',
          description: 'Redeemed 500 points',
          points: -500,
          reference: 'Rewards Store'
        },
        {
          type: 'bonus',
          title: 'Birthday Bonus',
          description: 'Annual Gift',
          points: 50,
          reference: 'Birthday'
        },
        {
          type: 'earn',
          title: 'Purchase – Smoke & CO Detector',
          description: 'Order #A9C1E4',
          points: 4499,
          reference: 'A9C1E4'
        }
      ]
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
