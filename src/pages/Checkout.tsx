import React, { useState, useMemo } from 'react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, ArrowLeft, CheckCircle2, ChevronDown,
  ShoppingBag, Truck, MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { DISTRICTS } from '../data/bangladeshLocations';
import emailjs from '@emailjs/browser';

const INSIDE_COST  = 78;
const OUTSIDE_COST = 118;

/* ── Styled select ─────────────────────────────────────────── */
const SelectField = ({
  id, value, onChange, placeholder, children, error, disabled = false,
}: {
  id: string; value: string; onChange: (v: string) => void;
  placeholder: string; children: React.ReactNode;
  error?: string; disabled?: boolean;
}) => (
  <div className="relative">
    <select
      id={id}
      value={value}
      disabled={disabled}
      onChange={e => onChange(e.target.value)}
      className={`w-full appearance-none border rounded-2xl px-5 py-4 pr-12 text-base
        focus:outline-none focus:ring-2 transition-all
        ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white cursor-pointer'}
        ${value ? 'text-gray-800' : 'text-gray-400'}
        ${error
          ? 'border-red-400 focus:ring-red-200'
          : 'border-gray-200 focus:ring-pink-200 focus:border-pink-400'}`}
    >
      <option value="" disabled>{placeholder}</option>
      {children}
    </select>
    <ChevronDown
      className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors
        ${disabled ? 'text-gray-300' : 'text-gray-400'}`}
      size={18}
    />
    {error && <p className="text-red-500 text-sm mt-1.5 ml-1">{error}</p>}
  </div>
);

/* ── Shipping Card ──────────────────────────────────────────── */
const ShippingCard = ({
  selected, onClick, title, subtitle, price, days,
}: {
  selected: boolean; onClick: () => void;
  title: string; subtitle: string; price: number; days: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 text-left
      ${selected
        ? 'border-pink-500 bg-pink-50 shadow-md shadow-pink-100'
        : 'border-gray-200 bg-white hover:border-pink-200 hover:bg-pink-50/30'}`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors
        ${selected ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
        <Truck size={20} />
      </div>
      <div>
        <p className={`font-bold text-sm ${selected ? 'text-pink-600' : 'text-gray-700'}`}>{title}</p>
        <p className="text-xs text-gray-400">{days}</p>
      </div>
    </div>
    <div className="text-right">
      <p className={`text-lg font-extrabold ${selected ? 'text-pink-500' : 'text-gray-700'}`}>৳{price}</p>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{subtitle}</p>
    </div>
  </button>
);

/* ── Main Component ─────────────────────────────────────────── */
const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess,    setIsSuccess]    = useState(false);
  const [orderId,      setOrderId]      = useState<string | null>(null);

  const [shippingMethod, setShippingMethod] = useState<'inside' | 'outside' | null>(null);
  const [form, setForm] = useState({
    name: '', phone: '', district: '', upazila: '',
    address: '', email: '', note: '',
  });
  const [saveAddress, setSaveAddress] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load saved address on mount
  useEffect(() => {
    const key = `glamour_saved_address_${user?.id || 'guest'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm(prev => ({ ...prev, ...parsed }));
        if (parsed.district === 'Dhaka') setShippingMethod('inside');
        else if (parsed.district) setShippingMethod('outside');
      } catch (e) {
        console.error('Error parsing saved address', e);
      }
    }
  }, [user]);

  const selectedDistrict = DISTRICTS.find(d => d.name === form.district);
  const upazilas         = selectedDistrict?.upazilas ?? [];
  const shippingCost     = shippingMethod === 'inside' ? INSIDE_COST : shippingMethod === 'outside' ? OUTSIDE_COST : 0;
  const grandTotal       = cartTotal + shippingCost;

  const setField = (field: string, value: string) => {
    setForm(p => {
      const next = { ...p, [field]: value };
      if (field === 'district') {
        next.upazila = '';
        // Auto-select shipping
        const autoMethod = value === 'Dhaka' ? 'inside' : 'outside';
        setShippingMethod(autoMethod as any);
      }
      return next;
    });
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())    e.name     = 'Name is required.';
    if (!form.phone.trim())   e.phone    = 'Phone is required.';
    if (!form.district)       e.district = 'District is required.';
    if (!form.address.trim()) e.address  = 'Address is required.';
    if (!shippingMethod)      e.shipping = 'Please select a shipping method.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      const orderData: any = {
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, brand: i.brand })),
        total: grandTotal,
        status: 'Pending',
        shipping_address: {
          fullName: form.name, phone: form.phone, email: form.email,
          district: form.district, upazila: form.upazila,
          address: form.address, note: form.note,
          shippingMethod: shippingMethod === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka',
          shippingCost,
        },
        created_at: new Date().toISOString(),
      };
      if (user) orderData.user_id = user.id;

      // Save address if checked
      if (saveAddress) {
        const key = `glamour_saved_address_${user?.id || 'guest'}`;
        const addressToSave = {
          name: form.name, phone: form.phone, email: form.email,
          district: form.district, upazila: form.upazila, address: form.address
        };
        localStorage.setItem(key, JSON.stringify(addressToSave));
      }

      const { data, error } = await supabase.from('orders').insert(orderData).select('id').single();
      if (error) throw error;

      // Send Email Notification (Background)
      try {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';
        
        if (serviceId && templateId && publicKey) {
          const emailParams = {
            order_id: data.id.slice(-8).toUpperCase(),
            customer_name: form.name,
            customer_phone: form.phone,
            customer_address: `${form.address}, ${form.upazila}, ${form.district}`,
            order_total: grandTotal.toLocaleString(),
            items_count: cart.reduce((s, i) => s + i.quantity, 0),
          };
          emailjs.send(serviceId, templateId, emailParams, publicKey)
            .catch(e => console.error('Email failed:', e));
        } else {
          console.log('EmailJS keys not configured. Skipping email notification.');
        }
      } catch (err) {
        console.error('Email preparation error:', err);
      }

      setOrderId(data?.id || null);
      clearCart();
      setIsSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  /* ── empty cart ── */
  if (cart.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 pt-44 text-center px-4">
        <ShoppingBag size={52} className="mx-auto mb-4 text-pink-400" />
        <h1 className="text-2xl font-bold mb-3 text-gray-800">Your bag is empty</h1>
        <Link to="/shop" className="text-pink-500 font-bold hover:underline uppercase tracking-widest text-sm">Go Shopping</Link>
      </div>
    );
  }

  /* ── success ── */
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-10 rounded-3xl shadow-lg text-center">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={44} />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Order Placed!</h1>
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 my-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Order Reference</p>
            <p className="text-xl font-bold text-pink-500 font-mono">#{orderId?.slice(-8).toUpperCase() || 'SUCCESS'}</p>
          </div>
          <p className="text-gray-500 text-sm mb-8">Thank you! Your order has been received and is being processed.</p>
          <Link to={user ? '/profile' : '/shop'}
            className="block w-full bg-[#1a1f3c] text-white py-4 rounded-2xl font-bold tracking-widest hover:bg-pink-500 transition-all mb-3">
            {user ? 'VIEW MY ORDERS' : 'CONTINUE SHOPPING'}
          </Link>
          <Link to="/" className="text-pink-500 font-bold hover:underline text-sm uppercase tracking-widest">Back to Home</Link>
        </motion.div>
      </div>
    );
  }

  /* ── main ── */
  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20">
      {/* Processing overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="w-14 h-14 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800">Processing Your Order…</h2>
              <p className="text-gray-400 text-sm mt-1">Please do not refresh the page.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <Link to="/cart" className="p-2 bg-white rounded-full hover:text-pink-500 transition-colors shadow-sm border border-gray-100">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── FORM ─────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">

            {/* Name */}
            <div>
              <input type="text" placeholder="Name" value={form.name}
                onChange={e => setField('name', e.target.value)}
                className={`w-full bg-white border rounded-2xl px-5 py-4 text-base focus:outline-none focus:ring-2 transition-all
                  ${errors.name ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-pink-200 focus:border-pink-400'}`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div>
              <input type="tel" placeholder="Phone" value={form.phone}
                onChange={e => setField('phone', e.target.value)}
                className={`w-full bg-white border rounded-2xl px-5 py-4 text-base focus:outline-none focus:ring-2 transition-all
                  ${errors.phone ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-pink-200 focus:border-pink-400'}`}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.phone}</p>}
            </div>

            {/* District */}
            <SelectField id="district" value={form.district} onChange={v => setField('district', v)}
              placeholder="Select District" error={errors.district}>
              {DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name} ({d.division})</option>)}
            </SelectField>

            {/* Upazila */}
            <SelectField id="upazila" value={form.upazila} onChange={v => setField('upazila', v)}
              placeholder={form.district ? 'Select Upazila / Area' : 'Select District First'}
              disabled={!form.district}>
              {upazilas.map(u => <option key={u} value={u}>{u}</option>)}
            </SelectField>

            {/* Address */}
            <div>
              <input type="text" placeholder="Address" value={form.address}
                onChange={e => setField('address', e.target.value)}
                className={`w-full bg-white border rounded-2xl px-5 py-4 text-base focus:outline-none focus:ring-2 transition-all
                  ${errors.address ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-pink-200 focus:border-pink-400'}`}
              />
              {errors.address && <p className="text-red-500 text-sm mt-1.5 ml-1">{errors.address}</p>}
            </div>

            {/* Email */}
            <input type="email" placeholder="Email (optional)" value={form.email}
              onChange={e => setField('email', e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-all"
            />

            {/* Note */}
            <textarea rows={3} placeholder="Order Note (optional)" value={form.note}
              onChange={e => setField('note', e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-base focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-all resize-none"
            />

            {/* Save Address Checkbox */}
            <label className="flex items-center gap-3 cursor-pointer group p-2">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-pink-500 peer-checked:border-pink-500 transition-all flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700">Save this delivery address for next time</span>
            </label>

            {/* ── Shipping Selection ─────────────────── */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <MapPin size={14} /> Delivery Method
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <ShippingCard
                  selected={shippingMethod === 'inside'}
                  onClick={() => setShippingMethod('inside')}
                  title="Inside Dhaka"
                  subtitle="1-2 days"
                  days="Delivery within 1–2 working days"
                  price={INSIDE_COST}
                />
                <ShippingCard
                  selected={shippingMethod === 'outside'}
                  onClick={() => setShippingMethod('outside')}
                  title="Outside Dhaka"
                  subtitle="2-3 days"
                  days="Delivery within 2–3 working days"
                  price={OUTSIDE_COST}
                />
              </div>
              {errors.shipping && (
                <p className="text-red-500 text-sm mt-2 ml-1">{errors.shipping}</p>
              )}
            </div>

            {/* Payment note */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 flex items-start gap-3">
              <ShieldCheck size={18} className="flex-shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-bold mb-0.5">Cash on Delivery</p>
                <p className="text-xs text-amber-700">bKash / Nagad / Rocket: <span className="font-bold">+880 1712-426871</span></p>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isProcessing}
              className="w-full bg-[#1a1f3c] hover:bg-pink-500 text-white py-5 rounded-2xl font-bold tracking-[0.12em] transition-all duration-300 shadow-lg flex items-center justify-center gap-3 text-sm uppercase disabled:opacity-60">
              <ShieldCheck size={18} />
              Confirm & Place Order
            </button>
          </form>

          {/* ── ORDER SUMMARY ─────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden sticky top-28">
              {/* Header */}
              <div className="bg-[#1a1f3c] text-white px-6 py-5 flex items-center gap-3">
                <ShoppingBag size={20} />
                <h2 className="text-lg font-bold tracking-wide">Order Summary</h2>
              </div>

              {/* Items */}
              <div className="px-6 py-4 space-y-4 max-h-64 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 flex-shrink-0">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="px-6 pb-5 space-y-3 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">৳{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping ({shippingMethod === 'inside' ? 'Inside Dhaka' : shippingMethod === 'outside' ? 'Outside Dhaka' : '—'})</span>
                  <span className={`font-semibold ${shippingCost ? 'text-gray-800' : 'text-gray-400'}`}>
                    {shippingCost ? `৳${shippingCost}` : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-xl font-extrabold text-pink-500">৳{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Pink bottom strip */}
              <div className="bg-[#e91e8c] px-6 py-3 flex items-center justify-between text-white">
                <span className="text-sm font-bold tracking-wide">
                  {cart.reduce((s, i) => s + i.quantity, 0)} ITEMS
                </span>
                <span className="text-lg font-extrabold">৳ {grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
