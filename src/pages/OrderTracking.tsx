import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Package, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  items: any[];
  shipping_address: any;
}

const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const stepIcon = (step: string) => {
  switch (step) {
    case 'Pending':    return Clock;
    case 'Processing': return Package;
    case 'Shipped':    return Truck;
    case 'Delivered':  return CheckCircle2;
    default:           return Clock;
  }
};

const OrderTracking = () => {
  const [orderId,  setOrderId]  = useState('');
  const [phone,    setPhone]    = useState('');
  const [order,    setOrder]    = useState<Order | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setNotFound(false);
    setOrder(null);

    try {
      const query = supabase
        .from('orders')
        .select('*')
        .ilike('id', `%${orderId.trim()}%`);

      const { data } = await query.limit(10);

      const match = data?.find(o =>
        o.id.slice(-8).toUpperCase() === orderId.trim().toUpperCase().replace('#', '') &&
        (!phone.trim() || o.shipping_address?.phone?.includes(phone.trim()))
      ) ?? data?.[0];

      if (match) {
        setOrder(match);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const currentStepIdx = order
    ? order.status === 'Cancelled'
      ? -1
      : STATUS_STEPS.findIndex(s => s.toLowerCase() === order.status.toLowerCase())
    : -1;

  return (
    <div className="min-h-screen bg-cream pt-32 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-gold font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Track Your Order</span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-charcoal">
            অর্ডার <span className="text-gold italic">ট্র্যাক</span>
          </h1>
          <p className="text-gray-500 mt-4">আপনার Order ID দিয়ে ডেলিভারি স্ট্যাটাস চেক করুন</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white rounded-3xl p-8 shadow-sm border border-gold/10 mb-8">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                Order ID (শেষের ৮ অক্ষর)
              </label>
              <input
                type="text"
                placeholder="যেমন: AB12CD34"
                value={orderId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderId(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-gold/20 uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                Phone Number (optional)
              </label>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-gold/20"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !orderId.trim()}
              className="w-full bg-gold hover:bg-charcoal text-white py-4 rounded-2xl font-bold tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50 uppercase"
            >
              <Search size={18} />
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </div>
        </form>

        {/* Not Found */}
        <AnimatePresence>
          {notFound && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600">
              <XCircle size={32} className="mx-auto mb-2" />
              <p className="font-bold">অর্ডার পাওয়া যায়নি</p>
              <p className="text-sm mt-1 text-red-400">Order ID বা Phone Number চেক করুন।</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order Result */}
        <AnimatePresence>
          {order && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white rounded-3xl shadow-sm border border-gold/10 overflow-hidden">

              {/* Header */}
              <div className="bg-charcoal text-white px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/50 uppercase tracking-widest">Order ID</p>
                    <p className="text-xl font-bold font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/50 uppercase tracking-widest">Total</p>
                    <p className="text-xl font-bold text-gold">৳{order.total?.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-xs text-white/40 mt-2">
                  {new Date(order.created_at).toLocaleString('bn-BD')}
                </p>
              </div>

              <div className="p-8 space-y-8">
                {/* Cancelled */}
                {order.status === 'Cancelled' ? (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-5 text-red-600">
                    <XCircle size={24} />
                    <div>
                      <p className="font-bold">অর্ডার বাতিল করা হয়েছে</p>
                      <p className="text-sm text-red-400">যোগাযোগ: 01712-426871</p>
                    </div>
                  </div>
                ) : (
                  /* Progress Timeline */
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Delivery Progress</p>
                    <div className="flex items-start">
                      {STATUS_STEPS.map((step, idx) => {
                        const Icon = stepIcon(step);
                        const done    = idx <= currentStepIdx;
                        const current = idx === currentStepIdx;
                        return (
                          <React.Fragment key={step}>
                            <div className="flex flex-col items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                                ${done ? 'bg-gold text-white shadow-lg shadow-gold/30' : 'bg-gray-100 text-gray-400'}`}>
                                <Icon size={18} />
                              </div>
                              <p className={`text-[10px] font-bold mt-2 text-center leading-tight max-w-[56px]
                                ${current ? 'text-gold' : done ? 'text-green-600' : 'text-gray-400'}`}>
                                {step}
                              </p>
                              {current && (
                                <span className="text-[8px] text-gold font-bold mt-0.5 uppercase tracking-wider">Now</span>
                              )}
                            </div>
                            {idx < STATUS_STEPS.length - 1 && (
                              <div className={`flex-1 h-0.5 mt-5 mx-1 rounded transition-all
                                ${idx < currentStepIdx ? 'bg-gold' : 'bg-gray-200'}`} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Items Ordered</p>
                  <div className="space-y-3">
                    {(order.items || []).map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                        <span className="text-gray-700">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                        <span className="font-bold text-charcoal">৳{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-gray-50 rounded-2xl p-5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Delivery Address</p>
                  <p className="font-bold text-charcoal">{order.shipping_address?.fullName}</p>
                  <p className="text-sm text-gray-500">{order.shipping_address?.phone}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.shipping_address?.address}, {order.shipping_address?.upazila}, {order.shipping_address?.district}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderTracking;
