import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ShoppingBag, Search, Eye, CheckCircle, Clock, Truck, XCircle, Download, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  created_at: string;
  shipping_address: any;
  items: any[];
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time order updates
    const subscription = supabase
      .channel('admin_orders_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'orders' 
      }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const firePurchaseEvent = (order: Order) => {
    fetch('/api/fb-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: 'Purchase',
        event_id: `purchase-${order.id}`,
        event_source_url: 'https://www.glamourstouch.com/checkout',
        em: order.shipping_address?.email || undefined,
        ph: order.shipping_address?.phone || undefined,
        custom_data: {
          value: order.total,
          currency: 'BDT',
          content_ids: (order.items || []).map((i: any) => i.id).filter(Boolean),
          contents: (order.items || []).map((i: any) => ({ id: i.id, quantity: i.quantity, item_price: i.price })),
          num_items: (order.items || []).reduce((n: number, i: any) => n + (i.quantity || 1), 0),
        },
      }),
    }).catch((err) => console.error('Purchase CAPI fire failed:', err));
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const previous = orders.find((o) => o.id === id);
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);
      if (error) throw error;

      // Purchase is only a real, confirmed sale the moment an order leaves "Pending" for
      // "Processing" — fire the server-side Meta Conversions API event on exactly that edge,
      // not on every status change, so re-toggling status never double-counts.
      if (previous?.status?.toLowerCase() === 'pending' && status.toLowerCase() === 'processing') {
        firePurchaseEvent({ ...previous, status });
      }

      // Refresh list
      fetchOrders();
      if (selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + (error.message || 'Unknown error'));
    }
  };

  const handleAcceptOrder = (id: string) => {
    updateStatus(id, 'Processing');
  };

  const handleDenyOrder = (id: string) => {
    updateStatus(id, 'Cancelled');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-600';
      case 'processing': return 'bg-blue-100 text-blue-600';
      case 'shipped': return 'bg-purple-100 text-purple-600';
      case 'delivered': return 'bg-green-100 text-green-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  // The WhatsApp/Messenger bot flags COD-abuse risk signals (fake-looking phone, incomplete
  // address, repeat cancellations for the same number) into this note before shipping.
  const riskNote = (order: Order) => {
    const note = order.shipping_address?.note as string | undefined;
    return note && note.startsWith('⚠️') ? note.replace(/^⚠️\s*VERIFY BEFORE SHIP:\s*/, '') : null;
  };

  const exportCSV = () => {
    if (!orders.length) return;
    const header = ['Order ID','Date','Customer','Phone','District','Address','Items','Total','Status'];
    const rows = orders.map(o => [
      `#${o.id.slice(0,8)}`,
      new Date(o.created_at).toLocaleDateString(),
      o.shipping_address?.fullName || 'Guest',
      o.shipping_address?.phone || '',
      `${o.shipping_address?.district || ''} ${o.shipping_address?.upazila || ''}`.trim(),
      o.shipping_address?.address || '',
      (o.items || []).map((i:any) => `${i.name}x${i.quantity}`).join(' | '),
      `৳${o.total}`,
      o.status,
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-charcoal">Orders</h1>
          <p className="text-gray-500 mt-1">Track and manage customer orders and fulfillment.</p>
        </div>
        <button onClick={exportCSV} disabled={!orders.length}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-40">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Mobile-Friendly Order Cards (Shown on mobile devices) */}
      <div className="block md:hidden space-y-4">
        {loading && orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
            <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-500 text-sm">
            No orders found.
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
              {/* Header: ID + Date + Status */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <div>
                  <span className="text-xs font-black text-gray-900 flex items-center gap-1">
                    {riskNote(order) && (
                      <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
                    )}
                    #{order.id.slice(0, 8)}
                  </span>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                <select
                  value={order.status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateStatus(order.id, e.target.value)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold/30 ${getStatusColor(order.status)}`}
                >
                  {['Pending','Processing','Shipped','Delivered','Cancelled'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Customer Info */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">{order.shipping_address?.fullName || 'Guest Customer'}</p>
                  <p className="text-xs text-gray-500">{order.shipping_address?.phone || order.shipping_address?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Total</p>
                  <p className="text-sm font-black text-charcoal">৳{order.total.toLocaleString()}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
                {order.status.toLowerCase() === 'pending' ? (
                  <div className="flex items-center gap-2 flex-grow">
                    <button 
                      onClick={() => handleAcceptOrder(order.id)}
                      className="flex-1 py-2 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-600 transition-colors shadow-sm uppercase"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => handleDenyOrder(order.id)}
                      className="flex-1 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-colors shadow-sm uppercase"
                    >
                      Deny
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 flex-grow font-medium">
                    Status: <span className="font-bold text-gray-700">{order.status}</span>
                  </div>
                )}
                <button 
                  onClick={() => setSelectedOrder(order)}
                  className="px-3.5 py-2 bg-gold/15 text-charcoal border border-gold/40 hover:bg-gold hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Eye size={14} /> Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest">
                <th className="px-6 py-4 font-bold">Order ID</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Total</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      <span className="flex items-center gap-1.5">
                        {riskNote(order) && (
                          <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" aria-label="Verify before shipping" />
                        )}
                        #{order.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{order.shipping_address?.fullName || 'Guest'}</p>
                      <p className="text-xs text-gray-500">{order.shipping_address?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-charcoal">৳{order.total.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateStatus(order.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold/30 ${getStatusColor(order.status)}`}
                      >
                        {['Pending','Processing','Shipped','Delivered','Cancelled'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 px-6">
                        {order.status.toLowerCase() === 'pending' && (
                          <div className="flex items-center gap-2 mr-4">
                            <button 
                              onClick={() => handleAcceptOrder(order.id)}
                              className="px-3 py-1.5 bg-green-500 text-white text-[10px] font-bold rounded-lg hover:bg-green-600 transition-colors shadow-sm shadow-green-500/20 uppercase"
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => handleDenyOrder(order.id)}
                              className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-colors shadow-sm shadow-red-500/20 uppercase"
                            >
                              Deny
                            </button>
                          </div>
                        )}
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-gray-400 hover:text-gold hover:bg-gold/10 rounded-lg transition-all"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div>
                  <h3 className="text-xl font-serif font-bold text-charcoal">Order Details</h3>
                  <p className="text-xs text-gray-500 mt-1">#{selectedOrder.id}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-200 rounded-full">
                  <XCircle size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8">
                {riskNote(selectedOrder) && (
                  <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 text-amber-600" />
                    <div>
                      <p className="font-bold text-amber-800 text-sm">Verify before shipping</p>
                      <p className="text-xs text-amber-700 mt-0.5">{riskNote(selectedOrder)}</p>
                    </div>
                  </div>
                )}

                {/* Status Update */}
                <div className="flex flex-wrap gap-3">
                  {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedOrder.id, status)}
                      className={`
                        px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                        ${selectedOrder.status.toLowerCase() === status.toLowerCase() 
                          ? getStatusColor(status) + ' ring-2 ring-offset-2 ring-current'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
                      `}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Customer Info */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Shipping Information</h4>
                    <div className="bg-gray-50 p-6 rounded-2xl space-y-2">
                      <p className="font-bold text-charcoal">{selectedOrder.shipping_address?.fullName}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.shipping_address?.email}</p>
                      <p className="text-sm text-gray-600">{selectedOrder.shipping_address?.phone}</p>
                      <p className="text-sm text-gray-600 pt-2 border-t border-gray-200 mt-2">
                        {selectedOrder.shipping_address?.address}<br />
                        {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.postalCode}
                      </p>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order Summary</h4>
                    <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{item.name} <span className="text-xs font-bold text-gray-400">x{item.quantity}</span></span>
                          <span className="font-bold text-charcoal">৳{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total Amount</span>
                        <span className="text-xl font-bold text-gold">৳{selectedOrder.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
