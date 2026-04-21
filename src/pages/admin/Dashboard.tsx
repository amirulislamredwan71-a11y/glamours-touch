import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState([
    { name: 'Total Revenue', value: '৳0', icon: DollarSign, change: '0%', positive: true },
    { name: 'Total Orders', value: '0', icon: ShoppingBag, change: '0%', positive: true },
    { name: 'Total Products', value: '0', icon: Package, change: '0%', positive: true },
    { name: 'Pending Orders', value: '0', icon: Clock, change: '0%', positive: true },
  ]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch Orders for Revenue and Count
      const { data: ordersData } = await supabase.from('orders').select('*');
      const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
      const { data: recent } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5);

      if (ordersData) {
        const totalRevenue = ordersData.reduce((acc, order) => acc + (order.total || 0), 0);
        const pendingCount = ordersData.filter(o => o.status && o.status.toLowerCase() === 'pending').length;

        setStats([
          { name: 'Total Revenue', value: `৳${totalRevenue.toLocaleString()}`, icon: DollarSign, change: '', positive: true },
          { name: 'Total Orders', value: ordersData.length.toString(), icon: ShoppingBag, change: '', positive: true },
          { name: 'Total Products', value: (productCount || 0).toString(), icon: Package, change: '', positive: true },
          { name: 'Pending Orders', value: pendingCount.toString(), icon: Clock, change: '', positive: pendingCount === 0 },
        ]);

        // Process Chart Data (Last 7 Days)
        const last7Days = Array.from({length: 7}, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return d.toISOString().split('T')[0];
        }).reverse();

        const dailyData = last7Days.map(date => {
          const dayOrders = ordersData.filter(o => o.created_at.startsWith(date));
          const revenue = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
          return { date: date.split('-').slice(1).join('/'), revenue, orders: dayOrders.length };
        });
        setChartData(dailyData);

        // Process Top Selling Products from actual order items
        const itemCounts: Record<string, any> = {};
        ordersData.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              if (!itemCounts[item.id]) {
                itemCounts[item.id] = { ...item, totalSold: 0, totalRevenue: 0 };
              }
              itemCounts[item.id].totalSold += (item.quantity || 1);
              itemCounts[item.id].totalRevenue += (item.price * (item.quantity || 1));
            });
          }
        });

        const sortedTop = Object.values(itemCounts)
          .sort((a: any, b: any) => b.totalSold - a.totalSold)
          .slice(0, 5);
        
        if (sortedTop.length > 0) {
          setTopProducts(sortedTop);
        } else {
          // Fallback if no orders with items
          const { data: top } = await supabase.from('products').select('*').limit(5);
          if (top) setTopProducts(top.map(p => ({ ...p, totalSold: 0 })));
        }
      }
      
      if (recent) setRecentOrders(recent);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-600';
      case 'delivered': return 'bg-green-100 text-green-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-serif font-bold text-charcoal">Dashboard Overview</h1>
        <p className="text-gray-500 mt-2">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gold/10 text-gold rounded-xl">
                  <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-bold ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                  {stat.positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium">{stat.name}</p>
              <h3 className="text-2xl font-bold text-charcoal mt-1">{stat.value}</h3>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
        <h3 className="font-bold text-charcoal mb-6">Revenue Overview (Last 7 Days)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#888' }}
                tickFormatter={(value) => `৳${value}`}
                dx={-10}
              />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`৳${value.toLocaleString()}`, 'Revenue']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#D4AF37" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#D4AF37', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-charcoal">Recent Orders</h3>
            <button className="text-gold text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest">
                  <th className="px-6 py-4 font-bold">Order ID</th>
                  <th className="px-6 py-4 font-bold">Customer</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400">No recent orders.</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.shipping_address?.fullName || 'Guest'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-charcoal">৳{order.total?.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-charcoal">Top Selling Products</h3>
            <button className="text-gold text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="p-6 space-y-6">
            {topProducts.length === 0 ? (
              <p className="text-center text-gray-400 py-10">No products sold yet.</p>
            ) : (
              topProducts.map((product, idx) => (
                <div key={product.id || idx} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-cover" />
                    <div className="absolute top-0 left-0 w-5 h-5 bg-gold text-white text-[10px] font-bold flex items-center justify-center rounded-br-lg">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="text-sm font-bold text-charcoal truncate">{product.name}</h4>
                    <p className="text-xs text-gray-500">{product.brand || 'Glamour\'s Touch'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-charcoal">{product.totalSold > 0 ? `${product.totalSold} Sold` : `৳${product.price?.toLocaleString()}`}</p>
                    {product.totalRevenue > 0 && (
                      <p className="text-xs text-gold font-bold">৳{product.totalRevenue.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
