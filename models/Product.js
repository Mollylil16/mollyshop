const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Sneakers & Streetwear', 'Luxe & Créateurs', 'Ville & Cérémonie', 'Baskets & Sport', 'Avant-Garde'] 
  },
  price: { type: Number, required: true, min: 100000 },
  oldPrice: { type: Number, default: null },
  description: { type: String, required: true },
  image: { type: String, required: true },
  badge: { type: String, default: null },
  badgeType: { type: String, default: 'gold' }, // 'gold', 'dark', 'subtle'
  sizes: { 
    type: [Number], 
    default: [39, 40, 41, 42, 43, 44, 45] 
  },
  colors: { 
    type: [String], 
    default: ['Noir Élégant', 'Blanc Écru', 'Finition Patinée'] 
  },
  stock: { type: Number, default: 8, min: 0 },
  rating: { type: Number, default: 4.9, min: 1, max: 5 },
  reviewsCount: { type: Number, default: 28 },
  isFeatured: { type: Boolean, default: false },
  isHero: { type: Boolean, default: false },
  tags: [String],
  specs: {
    upperMaterial: { type: String, default: 'Cuir pleine fleur ou suède noble' },
    sole: { type: String, default: 'Semelle ergonomique & cousue de haute tenue' },
    origin: { type: String, default: 'Importation certifiée originale' }
  }
}, { timestamps: true });

productSchema.index({ name: 'text', brand: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
