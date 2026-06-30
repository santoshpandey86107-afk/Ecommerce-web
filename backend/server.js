import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'shopwave-dev-secret';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const ALLOWED_ORIGINS = [CLIENT_URL, 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS origin denied: ${origin}`));
  }
}));
app.options('*', cors());
app.use(express.json());

const products = [
  { id: 1, name: 'Wireless Noise-Cancelling Headphones', price: 249.99, originalPrice: 329.99, category: 'Electronics', rating: 4.8, reviews: 2341, stock: 12, image: '🎧', description: 'Premium over-ear headphones with 30-hour battery life, active noise cancellation, and crystal-clear audio.', tags: ['bestseller', 'new'] },
  { id: 2, name: 'Merino Wool Crew Sweater', price: 89.00, originalPrice: null, category: 'Clothing', rating: 4.6, reviews: 876, stock: 34, image: '🧥', description: 'Soft, breathable merino wool in a classic crew-neck silhouette. Perfect for layering in any season.', tags: [] },
  { id: 3, name: 'Smart Indoor Garden Kit', price: 149.95, originalPrice: 179.95, category: 'Home & Garden', rating: 4.7, reviews: 512, stock: 8, image: '🌿', description: 'Grow herbs and greens year-round with automated lighting and watering. Includes seed pods for 12 plants.', tags: ['new'] },
  { id: 4, name: 'Carbon Fiber Road Bicycle Helmet', price: 119.00, originalPrice: null, category: 'Sports', rating: 4.9, reviews: 1203, stock: 20, image: '🚴', description: 'Aerodynamic, lightweight helmet with MIPS technology and 22 ventilation channels. Road-tested safety.', tags: ['bestseller'] },
  { id: 5, name: 'Design Thinking Handbook', price: 34.99, originalPrice: 44.99, category: 'Books', rating: 4.5, reviews: 389, stock: 50, image: '📚', description: 'A practical guide to applying design thinking in business and product development. Written by IDEO veterans.', tags: [] },
  { id: 6, name: 'Mechanical Gaming Keyboard', price: 159.00, originalPrice: 199.00, category: 'Electronics', rating: 4.7, reviews: 1580, stock: 15, image: '⌨️', description: 'Compact TKL layout with tactile switches, per-key RGB lighting, and USB-C braided cable.', tags: ['bestseller'] },
  { id: 7, name: 'Yoga Mat Pro (6mm)', price: 68.00, originalPrice: null, category: 'Sports', rating: 4.6, reviews: 732, stock: 40, image: '🧘', description: 'Non-slip, eco-friendly natural rubber yoga mat with alignment lines and a microfiber top surface.', tags: [] },
  { id: 8, name: 'Linen Blend Chinos', price: 75.00, originalPrice: 95.00, category: 'Clothing', rating: 4.4, reviews: 445, stock: 22, image: '👖', description: 'Relaxed fit chinos in a breathable linen-cotton blend. Available in neutral tones.', tags: [] },
  { id: 9, name: 'Cast Iron Dutch Oven (6 qt)', price: 89.95, originalPrice: 120.00, category: 'Home & Garden', rating: 4.9, reviews: 2100, stock: 18, image: '🍲', description: 'Enameled cast iron for oven, stovetop, and outdoor use. Even heat distribution for perfect braises.', tags: ['bestseller'] },
  { id: 10, name: '4K Action Camera', price: 299.00, originalPrice: 349.00, category: 'Electronics', rating: 4.8, reviews: 924, stock: 7, image: '📷', description: 'Waterproof to 40m, 4K/60fps video, 20MP photos, HyperSmooth stabilization, and voice control.', tags: ['new'] },
  { id: 11, name: 'Graphic Novel: The Quiet Universe', price: 22.00, originalPrice: null, category: 'Books', rating: 4.7, reviews: 214, stock: 30, image: '📖', description: 'Award-winning sci-fi graphic novel exploring isolation, connection, and identity across the cosmos.', tags: ['new'] },
  { id: 12, name: 'Stainless Steel Water Bottle (32oz)', price: 39.95, originalPrice: null, category: 'Sports', rating: 4.8, reviews: 3421, stock: 60, image: '🍶', description: 'Double-wall vacuum insulated. Keeps drinks cold 24h, hot 12h. Leak-proof lid, BPA-free.', tags: ['bestseller'] }
];

const users = [];
const orders = [];

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.get('/api/products', (req, res) => {
  const { category, search, maxPrice, onSale, sort } = req.query;
  let filtered = [...products];

  if (category && category !== 'All') filtered = filtered.filter((p) => p.category === category);
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
  }
  if (maxPrice) filtered = filtered.filter((p) => p.price <= Number(maxPrice));
  if (onSale === 'true') filtered = filtered.filter((p) => p.originalPrice !== null);

  if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  if (sort === 'reviews') filtered.sort((a, b) => b.reviews - a.reviews);

  res.json({ products: filtered });
});

app.get('/api/products/categories', (_req, res) => {
  res.json({ categories: ['All', 'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'] });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });
  const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) return res.status(409).json({ message: 'User already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: Date.now().toString(), name, email, password: hashed, orders: [] };
  users.push(user);
  const token = signToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, orders: user.orders } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, orders: user.orders } });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: { id: user.id, name: user.name, email: user.email, orders: user.orders } });
});

app.post('/api/orders', authMiddleware, (req, res) => {
  const { items, shippingAddress } = req.body;
  if (!items?.length) return res.status(400).json({ message: 'Cart is empty' });
  const order = {
    id: Date.now().toString(),
    items,
    shippingAddress: shippingAddress || { city: 'Demo City', country: 'US' },
    total: items.reduce((sum, item) => sum + item.price * item.qty, 0),
    status: 'placed',
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  const user = users.find((u) => u.id === req.user.id);
  if (user) user.orders.push(order);
  res.json({ order });
});

app.get('/api/orders/my', authMiddleware, (req, res) => {
  const user = users.find((u) => u.id === req.user.id);
  res.json({ orders: user?.orders || [] });
});

app.get('/api/payment/config', (_req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_demo' });
});

app.listen(PORT, () => {
  console.log(`ShopWave backend running on http://localhost:${PORT}`);
});
