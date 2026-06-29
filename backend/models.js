import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: Number,
  originalPrice: Number,
  category: String,
  rating: Number,
  reviews: Number,
  stock: Number,
  image: String,
  description: String,
  tags: [String]
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: Array,
  shippingAddress: Object,
  total: Number,
  status: { type: String, default: 'placed' },
  paid: { type: Boolean, default: false }
}, { timestamps: true });

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
