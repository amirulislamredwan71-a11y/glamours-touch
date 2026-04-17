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

const Dashboard = () => {
  const [stats, setStats] = useState([
    { name: 'Total Revenue', value: '৳0', icon: DollarSign, change: '0%', positive: true },
    { name: 'Total Orders', value: '0', icon: ShoppingBag, change: '0%', positive: true },
    { name: 'Total Products', value: '0', icon: Package, change: '0%', positive: true },
    { name: 'Pending Orders', value: '0', icon: Clock, change: '0%', positive: true },
  ]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
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
      }
      
      if (recent) setRecentOrders(recent);

      // Top Products - For now, we'll just show some featured products as "Top Selling"
      const { data: top } = await supabase.from('products').select('*').limit(4);
      if (top) setTopProducts(top);

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
            <h3 className="font-bold text-charcoal">Top Products</h3>
            <button className="text-gold text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="p-6 space-y-6">
            {topProducts.length === 0 ? (
              <p className="text-center text-gray-400 py-10">No products found.</p>
            ) : (
              topProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-bold text-charcoal">{product.name}</h4>
                    <p className="text-xs text-gray-500">{product.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-charcoal">৳{product.price?.toLocaleString()}</p>
                    <p className="text-xs text-gold font-bold">{product.rating} ★</p>
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
