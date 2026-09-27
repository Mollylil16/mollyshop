const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  brand: { type: String },
  price: { type: Number, required: true },
  size: { type: Number, required: true },
  color: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  image: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => 'MS-' + Math.floor(100000 + Math.random() * 900000) 
  },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: "Côte d'Ivoire" }
  },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  shipping: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Mobile Money' },
  status: { 
    type: String, 
    enum: ['Confirmée', 'En préparation', 'Expédiée', 'Livrée'], 
    default: 'Confirmée' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
