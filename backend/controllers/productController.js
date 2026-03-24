const Product = require('../models/Product');
const Order = require('../models/Order');

exports.getProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(8);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: {
        $lte: [
          { $ifNull: ['$stock', 0] },
          { $ifNull: ['$lowStockThreshold', 5] }
        ]
      }
    })
      .select('name sku stock lowStockThreshold category updatedAt')
      .sort({ stock: 1, updatedAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getScmTransparencyStats = async (req, res) => {
  try {
    const orderCount = await Order.countDocuments();
    const baseActual = orderCount * 12;
    const chartData = [
      { month: 'Jul', forecast: 320, actual: baseActual > 0 ? baseActual + 50 : 280 },
      { month: 'Aug', forecast: 450, actual: baseActual > 0 ? baseActual + 100 : 420 },
      { month: 'Sep', forecast: 680, actual: baseActual > 0 ? baseActual + 200 : 710 },
      { month: 'Oct', forecast: 500, actual: baseActual > 0 ? baseActual + 30 : 540 },
      { month: 'Nov', forecast: 420, actual: baseActual > 0 ? baseActual : 390 },
      { month: 'Dec', forecast: 890, actual: baseActual > 0 ? baseActual + 400 : 920 }
    ];

    const products = await Product.find().limit(6);
    const inventory = products.map(p => ({
      name: p.name,
      stock: Number(p.stock) || 0,
      units: Number(p.stock) || 0,
      max: Math.max((Number(p.stock) || 0) + 100, 100),
      color: (Number(p.stock) || 0) <= (p.lowStockThreshold || 5) ? '#dc2626' : (Number(p.stock) || 0) <= ((p.lowStockThreshold || 5) + 10) ? '#d97706' : '#16a34a',
      alert: (Number(p.stock) || 0) <= (p.lowStockThreshold || 5)
        ? `Low stock: ${p.name} is at ${Number(p.stock) || 0} units`
        : null,
      alertColor: (Number(p.stock) || 0) <= (p.lowStockThreshold || 5) ? '#dc2626' : '#d97706'
    }));

    const uniqueBrands = await Product.distinct('brand');
    const suppliers = uniqueBrands.slice(0, 4).map((brand, i) => ({
      name: brand,
      region: ['North America', 'Europe', 'Asia Pacific', 'South America'][i % 4],
      status: 'Active',
      flag: ['🇺🇸', '🇩🇪', '🇯🇵', '🇧🇷'][i % 4],
      rating: ['⭐⭐⭐⭐⭐ 4.9', '⭐⭐⭐⭐⭐ 4.8', '⭐⭐⭐⭐ 4.4', '⭐⭐⭐⭐ 4.3'][i % 4],
      products: ['First Aid Kits', 'Fire Equipment', 'Preparedness Kits', 'Personal Safety'][i % 4],
      lead: ['3 days', '5 days', '10 days', '14 days'][i % 4],
      moq: ['25 units', '50 units', '80 units', '100 units'][i % 4],
      tier: i < 2 ? 'Tier 1' : 'Tier 2',
      tierColor: i < 2 ? '#dcfce7' : '#dbeafe',
      tierText: i < 2 ? '#16a34a' : '#3b82f6'
    }));

    res.json({ chartData, inventory, suppliers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
