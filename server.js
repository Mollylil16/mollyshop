const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const Product = require('./models/Product');
const Order = require('./models/Order');
const { shoesData } = require('./seeds/seedData');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27018/mollyshop';
const MONGO_URI_FALLBACK = 'mongodb://127.0.0.1:27017/mollyshop';

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static files (Serve the frontend and shoe images)
app.use('/img', express.static(path.join(__dirname, 'img')));
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB with automatic fallback between port 27018 and 27017
async function connectDB() {
  try {
    console.log(`🔌 Connexion à MongoDB sur ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    console.log(`⚡ MongoDB connecté avec succès sur : ${MONGO_URI}`);
  } catch (err) {
    console.log(`⚠️ Échec port 27018, basculement sur ${MONGO_URI_FALLBACK}...`);
    try {
      await mongoose.connect(MONGO_URI_FALLBACK, { serverSelectionTimeoutMS: 3000 });
      console.log(`⚡ MongoDB connecté avec succès sur : ${MONGO_URI_FALLBACK}`);
    } catch (err2) {
      console.error('❌ Impossible de se connecter à MongoDB :', err2.message);
    }
  }

  // Auto-seed if database is empty
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('🌱 Base de données vide détectée. Auto-seeding en cours...');
      await Product.insertMany(shoesData);
      console.log(`✨ ${shoesData.length} modèles insérés automatiquement !`);
    }
  } catch (e) {
    console.error('Erreur lors de l\'auto-seed :', e.message);
  }
}

connectDB();

// ==========================================
// API ROUTES
// ==========================================

// 1. Get all products with advanced filtering & sorting
app.get('/api/products', async (req, res) => {
  try {
    const { category, brand, search, minPrice, maxPrice, sort, featured, tag } = req.query;
    let query = {};

    if (category && category !== 'Tous') {
      query.category = category;
    }

    if (brand && brand !== 'Toutes') {
      query.brand = brand;
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { brand: regex },
        { category: regex },
        { tags: regex },
        { description: regex }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'popularity') sortOption = { reviewsCount: -1 };

    const products = await Product.find(query).sort(sortOption);
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Get Single Product by ID + Related Products
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit introuvable' });
    }

    // Get 4 related products from same category or brand
    const related = await Product.find({
      _id: { $ne: product._id },
      $or: [{ category: product.category }, { brand: product.brand }]
    }).limit(4);

    res.json({
      success: true,
      data: product,
      related
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Get Hero Product & Featured Highlights
app.get('/api/highlights', async (req, res) => {
  try {
    const heroProduct = await Product.findOne({ isHero: true }) || await Product.findOne();
    const featured = await Product.find({ isFeatured: true }).limit(6);
    const trending = await Product.find().sort({ rating: -1, reviewsCount: -1 }).limit(4);

    res.json({
      success: true,
      hero: heroProduct,
      featured,
      trending
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Get Categories & Brand statistics
app.get('/api/metadata', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const brands = await Product.distinct('brand');
    const totalCount = await Product.countDocuments();
    
    // Aggregation for category counts
    const categoryCounts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      totalCount,
      categories,
      brands,
      categoryCounts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 5. Create New Order (Checkout)
app.post('/api/orders', async (req, res) => {
  try {
    const { customer, items, subtotal, shipping, discount, total, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Le panier est vide.' });
    }

    if (!customer || !customer.name || !customer.email || !customer.address) {
      return res.status(400).json({ success: false, message: 'Veuillez remplir toutes les informations de livraison.' });
    }

    const newOrder = new Order({
      customer,
      items,
      subtotal,
      shipping: shipping || 0,
      discount: discount || 0,
      total,
      paymentMethod: paymentMethod || 'Carte Bancaire (Simulé)'
    });

    const savedOrder = await newOrder.save();

    // Decrement stock for ordered items
    for (const item of items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Commande validée avec succès !',
      order: savedOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 6. Get Recent Orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7. Manual Seed Endpoint
app.post('/api/seed', async (req, res) => {
  try {
    await Product.deleteMany({});
    const inserted = await Product.insertMany(shoesData);
    res.json({
      success: true,
      message: `${inserted.length} produits insérés avec succès dans MongoDB !`,
      count: inserted.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin Dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serve frontend for all standard routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 mollyShop Server opérationnel sur http://localhost:${PORT}`);
  console.log(`💎 Interface prête avec intégration MongoDB`);
});
