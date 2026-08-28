import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  Image as ImageIcon,
  Tags,
  Star,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { supabase } from '../../lib/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderRow {
  id: string;
  total: number;
  status: string;
  created_at: string;
  items?: any;
  shipping_address?: any;
}

interface ProductRow {
  id: string;
  name: string;
  brand?: string;
  price: number;
  images?: string[];
  image?: string;
  in_stock?: boolean;
  category?: string;
  rating?: number;
  reviews?: number;
  isFeatured?: boolean;
  created_at?: string;
}

interface CategoryRow {
  id: string;
  name: string;
  image?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  processing: '#3B82F6',
  shipped: '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444',
};
const FALLBACK_STATUS_COLOR = '#9CA3AF';

const getStatusPillClass = (status?: string) => {
  switch ((status || '').toLowerCase()) {
    case 'pending': return 'bg-amber-100 text-amber-700';
    case 'processing': return 'bg-blue-100 text-blue-700';
    case 'shipped': return 'bg-violet-100 text-violet-700';
    case 'delivered': return 'bg-emerald-100 text-emerald-700';
    case 'cancelled': return 'bg-rose-100 text-rose-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const num = (n: any): number => (typeof n === 'number' && !Number.isNaN(n) ? n : 0);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const Dashboard = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async () => {
    try {
      const [ordersRes, productsRes, categoriesRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('*'),
        supabase.from('categories').select('*'),
      ]);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  // ---- KPIs ----
  // Cancelled orders (including test/bogus ones marked Cancelled for exactly this reason) never
  // counted as revenue -- summing every status here made a cancelled ৳0-value order look identical
  // to a real completed sale.
  const totalRevenue = useMemo(
    () => orders.filter((o) => (o.status || '').toLowerCase() !== 'cancelled').reduce((sum, o) => sum + num(o.total), 0),
    [orders]
  );
  const totalOrders = orders.length;
  const nonCancelledOrders = useMemo(
    () => orders.filter((o) => (o.status || '').toLowerCase() !== 'cancelled').length,
    [orders]
  );
  const pendingOrders = useMemo(
    () => orders.filter((o) => (o.status || '').toLowerCase() === 'pending').length,
    [orders]
  );
  const totalProducts = products.length;
  const soldOutCount = useMemo(() => products.filter((p) => p.in_stock === false).length, [products]);
  const avgOrderValue = nonCancelledOrders > 0 ? totalRevenue / nonCancelledOrders : 0;

  // ---- Revenue / orders trend (last 14 days) ----
  const trendData = useMemo(() => {
    const DAYS = 14;
    const buckets: { key: string; label: string; revenue: number; orders: number }[] = [];
    const today = new Date();
    for (let i = DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      buckets.push({ key, label: `${d.getDate()}/${d.getMonth() + 1}`, revenue: 0, orders: 0 });
    }
    const byKey = new Map(buckets.map((b) => [b.key, b]));
    orders.forEach((o) => {
      if (!o.created_at || typeof o.created_at !== 'string') return;
      const key = o.created_at.slice(0, 10);
      const bucket = byKey.get(key);
      if (bucket) {
        bucket.revenue += num(o.total);
        bucket.orders += 1;
      }
    });
    return buckets;
  }, [orders]);

  // ---- Order status breakdown ----
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      const s = (o.status || 'unknown').toLowerCase();
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // ---- Top products (by reviews) ----
  const topProducts = useMemo(
    () => [...products].sort((a, b) => num(b.reviews) - num(a.reviews)).slice(0, 5),
    [products]
  );

  // ---- Stock alerts ----
  const outOfStock = useMemo(() => products.filter((p) => p.in_stock === false).slice(0, 6), [products]);

  // ---- Category mix ----
  const categoryMix = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const c = p.category || 'Uncategorized';
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [products]);
  const maxCategoryCount = Math.max(1, ...categoryMix.map((c) => c.count));

  // ---- Recent orders ----
  const recentOrders = orders.slice(0, 8);

  const todayLabel = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal">Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">আজকের overview • {todayLabel}</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-charcoal text-sm font-bold shadow-sm hover:shadow-md hover:border-gold/40 transition-all disabled:opacity-60"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          idx={0}
          icon={DollarSign}
          color="gold"
          label="Total Revenue"
          value={`৳${totalRevenue.toLocaleString()}`}
          hint="All orders combined"
        />
        <StatCard
          idx={1}
          icon={ShoppingBag}
          color="emerald"
          label="Total Orders"
          value={totalOrders.toLocaleString()}
          hint={`${pendingOrders} pending`}
          hintTone={pendingOrders > 0 ? 'warn' : 'ok'}
        />
        <StatCard
          idx={2}
          icon={Package}
          color="violet"
          label="Products"
          value={totalProducts.toLocaleString()}
          hint={`${soldOutCount} sold out`}
          hintTone={soldOutCount > 0 ? 'danger' : 'ok'}
        />
        <StatCard
          idx={3}
          icon={Gauge}
          color="rose"
          label="Avg Order Value"
          value={`৳${Math.round(avgOrderValue).toLocaleString()}`}
          hint="Revenue ÷ Orders"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 min-w-0"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-charcoal">Revenue Trend</h3>
              <p className="text-xs text-gray-400">Last 14 days</p>
            </div>
            <TrendingUp className="text-gold" size={20} />
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C59B17" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#C59B17" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#999' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#999' }}
                  tickFormatter={(v: number) => `৳${v}`}
                  width={54}
                />
                <RechartsTooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#C59B17" strokeWidth={2.5} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 min-w-0"
        >
          <h3 className="font-bold text-charcoal mb-1">Order Status</h3>
          <p className="text-xs text-gray-400 mb-4">Breakdown by status</p>
          {statusData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">No orders yet</div>
          ) : (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || FALLBACK_STATUS_COLOR} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number, name: string) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2">
            {statusData.map((s) => (
              <span key={s.name} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-600 capitalize">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLORS[s.name] || FALLBACK_STATUS_COLOR }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Insights row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-charcoal">Top Products</h3>
            <Star size={18} className="text-gold" />
          </div>
          {topProducts.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No products yet.</p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map((p) => (
                <li key={p.id}>
                  <Link to={`/product/${p.id}`} className="flex items-center gap-3 group">
                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={p.image || (Array.isArray(p.images) ? p.images[0] : undefined) || 'https://via.placeholder.com/80'}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <p className="text-sm font-bold text-charcoal truncate group-hover:text-gold transition-colors">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-400">{num(p.reviews)} reviews</p>
                    </div>
                    <p className="text-sm font-bold text-gold flex-shrink-0">৳{num(p.price).toLocaleString()}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Stock Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-charcoal">Stock Alerts</h3>
            <AlertTriangle size={18} className="text-rose-500" />
          </div>
          {outOfStock.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 size={28} className="text-emerald-500 mb-2" />
              <p className="text-sm font-bold text-charcoal">All in stock ✓</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {outOfStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-charcoal truncate">{p.name}</p>
                    <p className="text-xs text-rose-500 font-bold">Sold Out</p>
                  </div>
                  <Link to="/admin/products" className="text-xs font-bold text-gold hover:underline flex-shrink-0">
                    Restock
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Category mix */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-charcoal">Category Mix</h3>
            <Tags size={18} className="text-violet-500" />
          </div>
          {categoryMix.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No categories yet.</p>
          ) : (
            <ul className="space-y-3">
              {categoryMix.map((c) => (
                <li key={c.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-charcoal truncate">{c.name}</span>
                    <span className="text-gray-400">{c.count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full"
                      style={{ width: `${(c.count / maxCategoryCount) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
          {categories.length === 0 && categoryMix.length === 0 && (
            <p className="text-center text-gray-300 text-xs mt-2">No categories configured.</p>
          )}
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-charcoal">Recent Orders</h3>
          <Link to="/admin/orders" className="text-gold text-sm font-bold hover:underline">
            View All
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">No orders yet.</p>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-100">
              {recentOrders.map((o) => (
                <Link to="/admin/orders" key={o.id} className="block p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-charcoal">#{(o.id || '').slice(0, 8)}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusPillClass(o.status)}`}>
                      {o.status || 'unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{o.created_at ? new Date(o.created_at).toLocaleDateString() : '-'}</span>
                    <span className="font-bold text-charcoal text-sm">৳{num(o.total).toLocaleString()}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest">
                    <th className="px-6 py-3 font-bold">Order</th>
                    <th className="px-6 py-3 font-bold">Customer / Item</th>
                    <th className="px-6 py-3 font-bold">Total</th>
                    <th className="px-6 py-3 font-bold">Status</th>
                    <th className="px-6 py-3 font-bold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((o) => {
                    const items = Array.isArray(o.items) ? o.items : [];
                    const firstItemName = items.length > 0 ? items[0]?.name : null;
                    const customer = o.shipping_address?.fullName || firstItemName || 'Guest';
                    return (
                      <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <Link to="/admin/orders" className="text-sm font-bold text-charcoal hover:text-gold">
                            #{(o.id || '').slice(0, 8)}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[200px]">{customer}</td>
                        <td className="px-6 py-4 text-sm font-bold text-charcoal">৳{num(o.total).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusPillClass(o.status)}`}>
                            {o.status || 'unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {o.created_at ? new Date(o.created_at).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </motion.div>

      {/* Quick Actions */}
      <div>
        <h3 className="font-bold text-charcoal mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction to="/admin/products" icon={PlusCircle} label="Add Product" />
          <QuickAction to="/admin/banners" icon={ImageIcon} label="Flash Banners" />
          <QuickAction to="/admin/orders" icon={ShoppingBag} label="Orders" />
          <QuickAction to="/admin/categories" icon={Tags} label="Categories" />
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

type StatColor = 'gold' | 'emerald' | 'violet' | 'rose';
type HintTone = 'ok' | 'warn' | 'danger';

const colorMap: Record<StatColor, { bg: string; text: string }> = {
  gold: { bg: 'bg-gold/10', text: 'text-gold' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  violet: { bg: 'bg-violet-100', text: 'text-violet-600' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-600' },
};

const hintToneMap: Record<HintTone, string> = {
  ok: 'text-emerald-500',
  warn: 'text-amber-500',
  danger: 'text-rose-500',
};

interface StatCardProps {
  idx: number;
  icon: React.ElementType;
  color: StatColor;
  label: string;
  value: string;
  hint?: string;
  hintTone?: HintTone;
}

const StatCard = ({ idx, icon: Icon, color, label, value, hint, hintTone = 'ok' }: StatCardProps) => {
  const c = colorMap[color] || colorMap.gold;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3, delay: idx * 0.06 }}
      className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow min-w-0"
    >
      <div className={`inline-flex p-2.5 sm:p-3 rounded-xl mb-3 sm:mb-4 ${c.bg} ${c.text}`}>
        <Icon size={20} />
      </div>
      <p className="text-gray-500 text-xs sm:text-sm font-medium truncate">{label}</p>
      <h3 className="text-lg sm:text-2xl font-bold text-charcoal mt-1 truncate">{value}</h3>
      {hint && <p className={`text-[11px] sm:text-xs font-bold mt-1.5 truncate ${hintToneMap[hintTone]}`}>{hint}</p>}
    </motion.div>
  );
};

const QuickAction = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col items-center justify-center gap-2 p-4 sm:p-6 rounded-2xl text-white shadow-sm hover:shadow-lg transition-all text-center"
      style={{ background: 'linear-gradient(135deg, #C59B17 0%, #E8C766 100%)' }}
    >
      <Icon size={22} />
      <span className="text-xs sm:text-sm font-bold">{label}</span>
    </motion.div>
  </Link>
);

const DashboardSkeleton = () => (
  <div className="space-y-6 sm:space-y-8 animate-pulse">
    <div className="h-9 w-48 bg-gray-200 rounded-lg" />
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-gray-100 rounded-2xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2 h-80 bg-gray-100 rounded-2xl" />
      <div className="h-80 bg-gray-100 rounded-2xl" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="h-64 bg-gray-100 rounded-2xl" />
      <div className="h-64 bg-gray-100 rounded-2xl" />
      <div className="h-64 bg-gray-100 rounded-2xl" />
    </div>
    <div className="h-64 bg-gray-100 rounded-2xl" />
  </div>
);

export default Dashboard;
