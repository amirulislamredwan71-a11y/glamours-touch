import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Truck, ArrowLeft, CheckCircle2, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] = useState<'inside' | 'outside' | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsProcessing(true);
    if (!shippingMethod) {
      alert('Please select a shipping method.');
      setIsProcessing(false);
      return;
    }

    try {
      // Simulate a small delay for "Processing" feel
      await new Promise(resolve => setTimeout(resolve, 1500));

      const shippingCost = shippingMethod === 'inside' ? 78 : 118;
      const orderData: any = {
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          brand: item.brand
        })),
        total: cartTotal + shippingCost,
        status: 'Pending',
        shipping_address: {
          ...formData,
          shippingMethod: shippingMethod === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka',
          shippingCost: shippingCost
        },
        created_at: new Date().toISOString()
      };

      // Only add user_id if user is logged in
      if (user) {
        orderData.user_id = user.id;
      }

      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select('id')
        .single();
      
      if (error) throw error;
      
      setOrderId(data?.id || null);
      setIsSuccess(true);
      clearCart();
    } catch (error: any) {
      console.error('Error creating order:', error);
      alert(error.message || 'Failed to place order. Please check your connection or try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-12 rounded-3xl shadow-xl border border-gold/10 text-center"
        >
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-4xl font-serif font-bold mb-4 text-charcoal">Order Placed!</h1>
          
          <div className="bg-cream/50 p-6 rounded-2xl border border-gold/10 mb-8 mt-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Your Order Reference</p>
            <p className="text-xl font-bold text-gold font-mono break-all">#{orderId?.slice(-8).toUpperCase() || 'SUCCESS'}</p>
          </div>

          <p className="text-gray-500 mb-10 text-sm">Thank you for choosing Glamour's Touch. Your order has been received and is being processed.</p>
          <Link 
            to={user ? "/profile" : "/shop"}
            className="block w-full bg-charcoal text-white py-4 rounded-full font-bold tracking-widest hover:bg-gold transition-all mb-4"
          >
            {user ? 'VIEW MY ORDERS' : 'CONTINUE SHOPPING'}
          </Link>
          <Link to="/" className="text-gold font-bold hover:underline text-sm uppercase tracking-widest">BACK TO HOME</Link>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-cream pt-40 text-center">
        <h1 className="text-3xl font-serif font-bold mb-4">Your bag is empty</h1>
        <Link to="/shop" className="text-gold font-bold hover:underline">GO SHOPPING</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence>
          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <h2 className="text-2xl font-serif font-bold text-charcoal">Processing Your Order...</h2>
                <p className="text-gray-500 mt-2">Please do not refresh the page.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-4 mb-12">
          <Link to="/cart" className="p-2 bg-white rounded-full hover:text-gold transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-4xl font-serif font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            {!user && (
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900">Guest Checkout</h3>
                    <p className="text-sm text-blue-700">You can place an order without an account.</p>
                  </div>
                </div>
                <button 
                  onClick={signIn}
                  className="text-blue-600 font-bold text-sm hover:underline"
                >
                  Sign in for rewards
                </button>
              </div>
            )}
            
            <form onSubmit={handlePlaceOrder}>
                {/* Step 1: Shipping */}
                <div className="bg-white p-10 rounded-3xl shadow-sm border border-gold/10 mb-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-gold text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <h2 className="text-2xl font-serif font-bold">Shipping Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Full Name</label>
                      <input name="fullName" type="text" required value={formData.fullName} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-6 py-4 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Email Address (Optional)</label>
                      <input name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-6 py-4 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Phone Number</label>
                      <input name="phone" type="tel" required value={formData.phone} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-6 py-4 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Delivery Address</label>
                      <textarea name="address" required rows={3} value={formData.address} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-6 py-4 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">City</label>
                      <input name="city" type="text" required value={formData.city} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-6 py-4 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Postal Code</label>
                      <input name="postalCode" type="text" required value={formData.postalCode} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded-lg px-6 py-4 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm" />
                    </div>
                  </div>
                </div>

                {/* Step 2: Shipping Method */}
                <div className="bg-white p-10 rounded-3xl shadow-sm border border-gold/10 mb-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-gold text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <h2 className="text-2xl font-serif font-bold">Shipping Method</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setShippingMethod('inside')}
                      className={`p-6 rounded-2xl border-2 transition-all text-left flex items-center justify-between group ${
                        shippingMethod === 'inside' 
                          ? 'border-gold bg-gold/5' 
                          : 'border-gray-100 bg-gray-50 hover:border-gold/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                          shippingMethod === 'inside' ? 'bg-gold text-white' : 'bg-white text-gray-400'
                        }`}>
                          <Truck size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-charcoal">Inside Dhaka</p>
                          <p className="text-xs text-gray-400">Delivery in 1-2 days</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-gold">৳78</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShippingMethod('outside')}
                      className={`p-6 rounded-2xl border-2 transition-all text-left flex items-center justify-between group ${
                        shippingMethod === 'outside' 
                          ? 'border-gold bg-gold/5' 
                          : 'border-gray-100 bg-gray-50 hover:border-gold/30'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                          shippingMethod === 'outside' ? 'bg-gold text-white' : 'bg-white text-gray-400'
                        }`}>
                          <Truck size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-charcoal">Outside Dhaka</p>
                          <p className="text-xs text-gray-400">Delivery in 2-3 days</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-gold">৳118</span>
                    </button>
                  </div>
                </div>

                {/* Step 3: Payment */}
                <div className="bg-white p-10 rounded-3xl shadow-sm border border-gold/10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-gold text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <h2 className="text-2xl font-serif font-bold">Payment Method</h2>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-4 p-6 bg-cream rounded-2xl border-2 border-gold cursor-pointer transition-all hover:bg-gold/5">
                      <input type="radio" name="payment" defaultChecked className="text-gold focus:ring-gold" />
                      <div className="flex-grow flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard size={24} className="text-gold" />
                          <span className="font-bold">Cash on Delivery</span>
                        </div>
                        <span className="text-xs text-gray-500 uppercase tracking-widest">Available</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-200 cursor-pointer transition-all hover:border-gold hover:bg-gold/5">
                      <input type="radio" name="payment" className="text-gold focus:ring-gold" />
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Smartphone size={24} className="text-gold" />
                            <span className="font-bold">bKash / Nagad / Rocket</span>
                          </div>
                          <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-bold">OPTIONAL</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Send payment to: <span className="font-bold text-charcoal">+880 1712-426871</span>
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="mt-10">
                    <button 
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-orange-500 text-white py-5 rounded-full font-bold tracking-widest hover:bg-orange-600 transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 relative overflow-hidden"
                    >
                      {isProcessing ? (
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1.5 }}
                          className="absolute inset-0 bg-white/20"
                        />
                      ) : null}
                      
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          VERIFYING ORDER...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={20} />
                          CONFIRM & PLACE ORDER
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gold/10 sticky top-32">
                <h2 className="text-2xl font-serif font-bold mb-8">Order Summary</h2>
                
                <div className="space-y-6 mb-8 max-h-80 overflow-y-auto pr-2">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-bold line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-gold">৳{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-gold/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-bold">৳{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-bold">৳{shippingMethod ? (shippingMethod === 'inside' ? 78 : 118) : 0}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-4 border-t border-gold/10">
                    <span>Total</span>
                    <span className="text-gold">৳{(cartTotal + (shippingMethod ? (shippingMethod === 'inside' ? 78 : 118) : 0)).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Checkout;
