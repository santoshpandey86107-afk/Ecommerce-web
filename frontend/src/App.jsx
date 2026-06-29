import { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/';
const getApiUrl = (path) => `${API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

const COLORS = {
  navy: '#0F1B2D',
  navyLight: '#1A2E48',
  accent: '#3B82F6',
  accentHover: '#2563EB',
  gold: '#F59E0B',
  surface: '#F8FAFC',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#0F172A',
  textMuted: '#64748B',
  success: '#10B981',
  danger: '#EF4444',
  tag: '#EFF6FF',
  tagText: '#1D4ED8'
};

const styleEl = document.createElement('style');
styleEl.textContent = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: ${COLORS.surface}; color: ${COLORS.text}; }
  input, select, textarea { font-family: inherit; }
  button { cursor: pointer; font-family: inherit; }
  a { text-decoration: none; color: inherit; }
  .btn-primary { background: ${COLORS.accent}; color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 600; transition: background .15s, transform .1s; }
  .btn-primary:hover { background: ${COLORS.accentHover}; }
  .btn-primary:active { transform: scale(.97); }
  .btn-ghost { background: transparent; color: ${COLORS.accent}; border: 1.5px solid ${COLORS.accent}; border-radius: 8px; padding: 9px 18px; font-size: 14px; font-weight: 600; }
  .btn-danger { background: ${COLORS.danger}; color: #fff; border: none; border-radius: 8px; padding: 9px 18px; font-size: 14px; font-weight: 600; }
  .card { background: ${COLORS.card}; border: 1px solid ${COLORS.border}; border-radius: 14px; }
  .input-base { width: 100%; padding: 10px 14px; border: 1.5px solid ${COLORS.border}; border-radius: 8px; font-size: 14px; color: ${COLORS.text}; background: #fff; outline: none; }
  .input-base:focus { border-color: ${COLORS.accent}; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
  .tag { background: ${COLORS.tag}; color: ${COLORS.tagText}; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 100; display: flex; align-items: flex-start; justify-content: flex-end; }
  .drawer { background: #fff; width: min(420px, 100vw); height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
`;
document.head.appendChild(styleEl);

function Stars({ rating }) {
  return (
    <span style={{ fontSize: 13 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: COLORS.gold }}>{i <= Math.round(rating) ? '★' : '☆'}</span>
      ))}
    </span>
  );
}

function Spinner() {
  return <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />;
}

function Navbar({ user, onSignOut, cartCount, onOpenCart, onNavigate }) {
  return (
    <nav style={{ background: COLORS.navy, color: '#fff', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${COLORS.navyLight}` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 16, height: 64 }}>
        <button onClick={() => onNavigate('shop')} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: -0.5, cursor: 'pointer' }}>
          🛍️ ShopWave
        </button>
        <div style={{ flex: 1 }} />
        {user ? (
          <>
            <span style={{ fontSize: 13, color: '#94A3B8' }}>Hi, {user.name.split(' ')[0]}</span>
            <button onClick={() => onNavigate('orders')} style={{ background: 'none', border: '1px solid #334155', borderRadius: 8, color: '#CBD5E1', padding: '6px 14px', fontSize: 13 }}>Orders</button>
            <button onClick={onSignOut} style={{ background: 'none', border: '1px solid #334155', borderRadius: 8, color: '#CBD5E1', padding: '6px 14px', fontSize: 13 }}>Sign out</button>
          </>
        ) : (
          <button onClick={() => onNavigate('auth')} className="btn-primary" style={{ padding: '7px 18px', fontSize: 13 }}>Sign in</button>
        )}
        <button onClick={onOpenCart} style={{ background: COLORS.accent, border: 'none', borderRadius: 10, color: '#fff', padding: '8px 16px', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          🛒 {cartCount > 0 && <span style={{ background: COLORS.gold, color: '#000', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{cartCount}</span>}Cart
        </button>
      </div>
    </nav>
  );
}

function AuthView({ onAuthSuccess }) {
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const validate = () => {
    const nextErrors = {};
    if (mode === 'register' && !form.name.trim()) nextErrors.name = 'Name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) nextErrors.email = 'Enter a valid email';
    if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
    return nextErrors;
  };

  const submit = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${API_BASE}api/auth/` + (mode === 'signin' ? 'login' : 'register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Authentication failed');
      localStorage.setItem('shopwave-token', data.token);
      onAuthSuccess(data.user);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ id, label, type = 'text', placeholder }) => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.textMuted, marginBottom: 6 }}>{label}</label>
      <input className="input-base" type={type} placeholder={placeholder} value={form[id]} onChange={(e) => { setForm((f) => ({ ...f, [id]: e.target.value })); setErrors((er) => ({ ...er, [id]: undefined })); }} />
      {errors[id] && <p style={{ color: COLORS.danger, fontSize: 12, marginTop: 4 }}>{errors[id]}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: 36 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{mode === 'signin' ? 'Welcome back' : 'Create an account'}</h1>
        <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 28 }}>{mode === 'signin' ? 'Sign in to your ShopWave account' : 'Join ShopWave and start shopping'}</p>
        {mode === 'register' && <Field id="name" label="Full name" placeholder="Alex Johnson" />}
        <Field id="email" label="Email" type="email" placeholder="you@example.com" />
        <Field id="password" label="Password" type="password" placeholder="••••••••" />
        {message && <p style={{ color: COLORS.danger, fontSize: 13, marginBottom: 14 }}>{message}</p>}
        <button className="btn-primary" onClick={submit} style={{ width: '100%', padding: 12, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={loading}>
          {loading && <Spinner />} {mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
        <div style={{ marginTop: 22, textAlign: 'center' }}>
          <span style={{ fontSize: 14, color: COLORS.textMuted }}>{mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}</span>
          <button onClick={() => { setMode(mode === 'signin' ? 'register' : 'signin'); setErrors({}); setForm({ name: '', email: '', password: '' }); }} style={{ background: 'none', border: 'none', color: COLORS.accent, fontWeight: 700, fontSize: 14 }}>{mode === 'signin' ? 'Sign up' : 'Sign in'}</button>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, onAdd }) {
  const [added, setAdded] = useState(false);
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  const handleAdd = () => {
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'default' }}>
      <div style={{ background: COLORS.surface, padding: 28, textAlign: 'center', fontSize: 64, borderBottom: `1px solid ${COLORS.border}` }}>{product.image}</div>
      <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="tag">{product.category}</span>
          {product.tags.includes('bestseller') && <span className="tag" style={{ background: '#D1FAE5', color: '#065F46' }}>Bestseller</span>}
          {product.tags.includes('new') && <span style={{ background: '#F0FDF4', color: '#166534', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>New</span>}
          {discount > 0 && <span style={{ background: '#FEF2F2', color: '#991B1B', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>-{discount}%</span>}
        </div>
        <p style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.4, color: COLORS.text }}>{product.name}</p>
        <p style={{ fontSize: 12.5, color: COLORS.textMuted, lineHeight: 1.5, flex: 1 }}>{product.description}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Stars rating={product.rating} />
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>{product.rating} ({product.reviews.toLocaleString()})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: COLORS.text }}>${product.price.toFixed(2)}</span>
          {product.originalPrice && <span style={{ fontSize: 13, color: COLORS.textMuted, textDecoration: 'line-through' }}>${product.originalPrice.toFixed(2)}</span>}
        </div>
        <p style={{ fontSize: 12, color: product.stock < 10 ? COLORS.danger : COLORS.success, fontWeight: 600 }}>{product.stock < 10 ? `Only ${product.stock} left` : 'In stock'}</p>
      </div>
      <div style={{ padding: '0 18px 16px' }}>
        <button className={added ? 'btn-ghost' : 'btn-primary'} style={{ width: '100%', transition: 'all 0.2s' }} onClick={handleAdd}>{added ? '✓ Added to cart' : 'Add to cart'}</button>
      </div>
    </div>
  );
}

function ShopView({ products, onAddToCart }) {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [priceMax, setPriceMax] = useState(400);
  const [onSale, setOnSale] = useState(false);

  const filtered = useMemo(() => {
    return [...products]
      .filter((p) => (category === 'All' || p.category === category))
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
      .filter((p) => p.price <= priceMax)
      .filter((p) => !onSale || p.originalPrice !== null)
      .sort((a, b) => {
        if (sort === 'price-asc') return a.price - b.price;
        if (sort === 'price-desc') return b.price - a.price;
        if (sort === 'rating') return b.rating - a.rating;
        if (sort === 'reviews') return b.reviews - a.reviews;
        return 0;
      });
  }, [products, category, search, sort, priceMax, onSale]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyLight} 100%)`, borderRadius: 16, padding: '40px 36px', marginBottom: 28, color: '#fff' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#93C5FD', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Summer sale — up to 30% off</p>
        <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -0.5, marginBottom: 12 }}>Shop what moves you.</h1>
        <p style={{ color: '#94A3B8', fontSize: 15, maxWidth: 480 }}>Discover curated picks across electronics, fashion, home, sports, and books — with fast shipping on every order.</p>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        <aside style={{ width: 220, flexShrink: 0 }}>
          <div className="card" style={{ padding: 20, position: 'sticky', top: 80 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 }}>Filters</h3>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Category</p>
              {['All', 'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'].map((c) => (
                <button key={c} onClick={() => setCategory(c)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 7, border: 'none', fontSize: 13, marginBottom: 2, background: category === c ? COLORS.tag : 'transparent', color: category === c ? COLORS.tagText : COLORS.text, fontWeight: category === c ? 700 : 400 }}>
                  {c}
                </button>
              ))}
            </div>
            <div style={{ marginBottom: 20, borderTop: `1px solid ${COLORS.border}`, paddingTop: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Max price: <strong>${priceMax}</strong></p>
              <input type="range" min="20" max="400" step="10" value={priceMax} onChange={(e) => setPriceMax(+e.target.value)} style={{ width: '100%', accentColor: COLORS.accent }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}><span>$20</span><span>$400</span></div>
            </div>
            <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <input type="checkbox" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} style={{ accentColor: COLORS.accent, width: 15, height: 15 }} />
                On sale only
              </label>
            </div>
          </div>
        </aside>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, position: 'relative', minWidth: 180 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: COLORS.textMuted, fontSize: 16 }}>🔍</span>
              <input className="input-base" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
            </div>
            <select className="input-base" value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating">Highest rated</option>
              <option value="reviews">Most reviewed</option>
            </select>
            <span style={{ fontSize: 13, color: COLORS.textMuted, whiteSpace: 'nowrap' }}>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
              <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No products found</p>
              <p style={{ color: COLORS.textMuted, fontSize: 14 }}>Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
              {filtered.map((product) => <ProductCard key={product.id} product={product} onAdd={onAddToCart} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function OrdersView({ orders }) {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Your orders</h1>
      {orders.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <p style={{ color: COLORS.textMuted }}>You have no orders yet.</p>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="card" style={{ padding: 20, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong>Order #{order.id}</strong>
              <span style={{ color: COLORS.success, fontWeight: 700 }}>{order.status}</span>
            </div>
            <p style={{ color: COLORS.textMuted, marginBottom: 8 }}>{new Date(order.createdAt).toLocaleDateString()}</p>
            <div>{order.items.map((item) => <p key={item.id} style={{ marginBottom: 4 }}>{item.name} × {item.qty}</p>)}</div>
            <p style={{ marginTop: 10, fontWeight: 700 }}>Total: ${order.total.toFixed(2)}</p>
          </div>
        ))
      )}
    </div>
  );
}

function CartDrawer({ cart, onClose, onUpdateQty, onRemove, onCheckout, user, checkoutForm, onCheckoutFormChange, checkoutMessage, checkoutLoading }) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="drawer">
        <div style={{ background: COLORS.navy, color: '#fff', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800 }}>Your cart</h2>
            <p style={{ color: '#94A3B8', fontSize: 13 }}>{cart.length} item{cart.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', color: '#fff', border: 'none', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 18 }}>
          {cart.length === 0 ? <p style={{ color: COLORS.textMuted }}>Your cart is empty.</p> : cart.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${COLORS.border}` }}>
              <div>
                <p style={{ fontWeight: 700 }}>{item.name}</p>
                <p style={{ color: COLORS.textMuted, fontSize: 13 }}>${item.price.toFixed(2)} each</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => onUpdateQty(item.id, -1)} style={{ width: 28, height: 28, border: '1px solid #ccc', background: '#fff', borderRadius: 6 }}>−</button>
                <span style={{ minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                <button onClick={() => onUpdateQty(item.id, 1)} style={{ width: 28, height: 28, border: '1px solid #ccc', background: '#fff', borderRadius: 6 }}>+</button>
                <button onClick={() => onRemove(item.id)} style={{ border: 'none', background: 'none', color: COLORS.danger }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${COLORS.border}`, padding: 18 }}>
          <div style={{ marginBottom: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Shipping details</p>
            <div style={{ display: 'grid', gap: 8 }}>
              <input className="input-base" placeholder="Full name" value={checkoutForm.fullName} onChange={(e) => onCheckoutFormChange({ ...checkoutForm, fullName: e.target.value })} />
              <input className="input-base" placeholder="Address" value={checkoutForm.address} onChange={(e) => onCheckoutFormChange({ ...checkoutForm, address: e.target.value })} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input className="input-base" placeholder="City" value={checkoutForm.city} onChange={(e) => onCheckoutFormChange({ ...checkoutForm, city: e.target.value })} />
                <input className="input-base" placeholder="ZIP" value={checkoutForm.zip} onChange={(e) => onCheckoutFormChange({ ...checkoutForm, zip: e.target.value })} />
              </div>
              <input className="input-base" placeholder="Country" value={checkoutForm.country} onChange={(e) => onCheckoutFormChange({ ...checkoutForm, country: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>Shipping</span><strong>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><span>Tax</span><strong>${tax.toFixed(2)}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, marginBottom: 12 }}><span>Total</span><span>${total.toFixed(2)}</span></div>
          {checkoutMessage && <p style={{ color: COLORS.success, fontSize: 13, marginBottom: 10 }}>{checkoutMessage}</p>}
          <button className="btn-primary" style={{ width: '100%', padding: 12 }} onClick={onCheckout} disabled={!user || cart.length === 0 || checkoutLoading}> {checkoutLoading ? 'Placing order...' : user ? 'Checkout' : 'Sign in to checkout'} </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [view, setView] = useState('shop');
  const [cartOpen, setCartOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutForm, setCheckoutForm] = useState({ fullName: '', address: '', city: 'Demo City', zip: '', country: 'US' });
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem('shopwave-cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch {
        localStorage.removeItem('shopwave-cart');
      }
    }

    const token = localStorage.getItem('shopwave-token');
    const loadData = async () => {
      try {
        const response = await fetch(getApiUrl('api/products'));
        const data = await response.json();
        setProducts(data.products || []);
        if (token) {
          const profileResponse = await fetch(getApiUrl('api/auth/me'), { headers: { Authorization: `Bearer ${token}` } });
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setUser(profileData.user);
            const ordersResponse = await fetch(getApiUrl('api/orders/my'), { headers: { Authorization: `Bearer ${token}` } });
            if (ordersResponse.ok) {
              const ordersData = await ordersResponse.json();
              setOrders(ordersData.orders || []);
            }
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('shopwave-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) return current.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...current, { ...product, qty: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (id, delta) => {
    setCart((current) => current.map((item) => item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item).filter((item) => item.qty > 0));
  };

  const removeItem = (id) => setCart((current) => current.filter((item) => item.id !== id));

  const handleCheckout = async () => {
    if (!user || cart.length === 0) return;
    setCheckoutLoading(true);
    setCheckoutMessage('');
    try {
      const token = localStorage.getItem('shopwave-token');
      const response = await fetch(getApiUrl('api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: cart,
          shippingAddress: {
            fullName: checkoutForm.fullName || user.name,
            address: checkoutForm.address,
            city: checkoutForm.city,
            zip: checkoutForm.zip,
            country: checkoutForm.country
          }
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Checkout failed');
      setOrders((current) => [data.order, ...current]);
      setCart([]);
      setCheckoutForm({ fullName: '', address: '', city: 'Demo City', zip: '', country: 'US' });
      setCheckoutMessage(`Order placed successfully. ID ${data.order.id}`);
      setCartOpen(false);
      setView('orders');
    } catch (error) {
      setCheckoutMessage(error.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleAuthSuccess = (authUser) => {
    setUser(authUser);
    setView('shop');
  };

  const handleSignOut = () => {
    localStorage.removeItem('shopwave-token');
    setUser(null);
    setView('shop');
  };

  return (
    <div>
      <Navbar user={user} onSignOut={handleSignOut} cartCount={cart.reduce((sum, item) => sum + item.qty, 0)} onOpenCart={() => setCartOpen(true)} onNavigate={setView} />
      {loading ? <div style={{ padding: 24, textAlign: 'center' }}>Loading ShopWave…</div> : (
        <>
          {view === 'auth' && <AuthView onAuthSuccess={handleAuthSuccess} />}
          {view === 'shop' && <ShopView products={products} onAddToCart={addToCart} />}
          {view === 'orders' && <OrdersView orders={orders} />}
        </>
      )}
      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onUpdateQty={updateQty} onRemove={removeItem} onCheckout={handleCheckout} user={user} checkoutForm={checkoutForm} onCheckoutFormChange={setCheckoutForm} checkoutMessage={checkoutMessage} checkoutLoading={checkoutLoading} />}
    </div>
  );
}
