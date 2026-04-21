import React, { useState, useEffect } from 'react';
import { User as UserIcon, Package, Heart, LogOut, ChevronRight, Mail, ShoppingBag, ShieldCheck, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../hooks/useUI';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const STATUSES = ['Pending','Processing','Shipped','Delivered'];

const statusIcon: Record<string,(s:number)=>React.ReactNode> = {
  Pending:    s => <Clock size={s} />,
  Processing: s => <Package size={s} />,
  Shipped:    s => <Truck size={s} />,
  Delivered:  s => <CheckCircle2 size={s} />,
  Cancelled:  s => <XCircle size={s} />,
};

const OrderTimeline = ({ status }: { status: string }) => {
  const cancelled = status === 'Cancelled';
  const steps = cancelled ? ['Pending','Cancelled'] : STATUSES;
  const currentIdx = steps.indexOf(status);
  return (
    <div className="mt-4 flex items-center gap-0">
      {steps.map((step, i) => {
        const done = i <= currentIdx;
        const isLast = i === steps.length - 1;
        const isCancelled = step === 'Cancelled';
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-all
                ${done
                  ? isCancelled ? 'bg-red-500' : 'bg-emerald-500'
                  : 'bg-gray-200 text-gray-400'}`}>
                {statusIcon[step]?.(12) ?? <span className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className={`text-[9px] font-bold mt-1 tracking-wide uppercase text-center
                ${done ? isCancelled ? 'text-red-500' : 'text-emerald-600' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 transition-all ${
                i < currentIdx ? (cancelled ? 'bg-red-300' : 'bg-emerald-400') : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const Profile = () => {
  const { user, loading, logout } = useAuth();
  const { openLogin } = useUI();
  const [orders, setOrders] = useState<any[]>([]);
  const [savedAddress, setSavedAddress] = useState<any>(null);

  useEffect(() => {
    // Load saved address
    const key = `glamour_saved_address_${user?.id || 'guest'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try { setSavedAddress(JSON.parse(saved)); } catch (e) {}
    }

    if (!user) return;

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders(data || []);
      }
    };

    fetchOrders();

    // Set up real-time subscription
    const subscription = supabase
      .channel('orders_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cream pt-40 pb-20 px-4">
        <div className="max-w-md mx-auto bg-white p-10 rounded-3xl shadow-xl border border-gold/10 text-center">
          <div className="w-20 h-20 bg-cream rounded-full flex items-center justify-center text-gold mx-auto mb-8">
            <UserIcon size={40} />
          </div>
          <h1 className="text-4xl font-serif font-bold mb-4">Welcome Back</h1>
          <p className="text-gray-500 mb-10">Sign in to your account to access your premium beauty profile and track your orders.</p>
          <button 
            onClick={openLogin}
            className="w-full bg-charcoal text-white py-5 rounded-full font-bold tracking-widest hover:bg-gold transition-all shadow-lg shadow-charcoal/20 flex items-center justify-center gap-3 uppercase"
          >
            <UserIcon size={20} />
            Login to Account
          </button>
        </div>
      </div>
    );
  }

  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || 'User';
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-cream pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gold/10">
              <div className="flex flex-col items-center text-center mb-8">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-24 h-24 rounded-full border-2 border-gold/20 mb-4" />
                ) : (
                  <div className="w-24 h-24 bg-gold rounded-full flex items-center justify-center text-white text-3xl font-serif font-bold mb-4">
                    {displayName.charAt(0)}
                  </div>
                )}
                <h2 className="text-2xl font-serif font-bold">{displayName}</h2>
                <p className="text-gray-500 text-sm">Premium Member</p>
              </div>

              <nav className="space-y-2">
                <button className="w-full flex items-center justify-between p-4 bg-gold text-white rounded-xl font-medium transition-all">
                  <div className="flex items-center gap-3">
                    <UserIcon size={18} />
                    <span>My Profile</span>
                  </div>
                  <ChevronRight size={16} />
                </button>
                <button className="w-full flex items-center justify-between p-4 hover:bg-cream rounded-xl font-medium transition-all">
                  <div className="flex items-center gap-3">
                    <Package size={18} />
                    <span>My Orders</span>
                  </div>
                  <ChevronRight size={16} />
                </button>
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 p-4 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-all mt-8"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gold/10">
              <h3 className="text-2xl font-serif font-bold mb-8">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gold uppercase tracking-widest mb-2">Full Name</label>
                    <div className="flex items-center gap-3 p-4 bg-cream rounded-xl">
                      <UserIcon size={18} className="text-gray-400" />
                      <span className="font-medium">{displayName}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gold uppercase tracking-widest mb-2">Email Address</label>
                    <div className="flex items-center gap-3 p-4 bg-cream rounded-xl">
                      <Mail size={18} className="text-gray-400" />
                      <span className="font-medium">{user.email}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gold uppercase tracking-widest mb-2">Account ID</label>
                    <div className="flex items-center gap-3 p-4 bg-cream rounded-xl">
                      <ShieldCheck size={18} className="text-gray-400" />
                      <span className="font-medium text-xs truncate">{user.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Book */}
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gold/10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-serif font-bold">Address Book</h3>
              </div>
              
              {savedAddress ? (
                <div className="p-6 bg-cream rounded-2xl border border-gold/10 relative">
                  <div className="absolute top-4 right-4 bg-gold/10 text-gold text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    Default
                  </div>
                  <h4 className="font-bold text-lg mb-1">{savedAddress.name}</h4>
                  <p className="text-gray-500 text-sm mb-4">{savedAddress.phone}</p>
                  
                  <div className="flex items-start gap-3 text-gray-700 text-sm">
                    <Truck size={18} className="text-gold flex-shrink-0 mt-0.5" />
                    <div>
                      <p>{savedAddress.address}</p>
                      <p>{savedAddress.upazila}, {savedAddress.district}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Truck size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No default delivery address saved.</p>
                  <p className="text-xs text-gray-400 mt-1">Your address will be saved here when you check the box during checkout.</p>
                </div>
              )}
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gold/10">
              <h3 className="text-2xl font-serif font-bold mb-8">Recent Orders</h3>
              {orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map(order => (
                    <div key={order.id} className="p-5 bg-cream rounded-2xl border border-gold/10">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="font-bold text-sm">Order #{order.id.slice(-6).toUpperCase()}</p>
                          <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gold text-sm">৳{order.total.toLocaleString()}</p>
                          <p className={`text-[10px] uppercase font-bold
                            ${order.status === 'Delivered' ? 'text-emerald-500'
                              : order.status === 'Cancelled' ? 'text-red-500'
                              : 'text-blue-500'}`}>
                            {order.status}
                          </p>
                        </div>
                      </div>
                      <OrderTimeline status={order.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center text-gold mx-auto mb-4">
                    <Package size={32} />
                  </div>
                  <p className="text-gray-500">You haven't placed any orders yet.</p>
                  <Link to="/shop" className="text-gold font-bold hover:underline mt-4 inline-block">START SHOPPING</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
