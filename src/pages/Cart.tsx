import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-cream pt-40 pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-gold mx-auto mb-8 shadow-sm">
            <ShoppingBag size={48} />
          </div>
          <h1 className="text-4xl font-serif font-bold mb-4">Your cart is empty</h1>
          <p className="text-gray-500 mb-10">Looks like you haven't added any treasures to your cart yet.</p>
          <Link 
            to="/shop"
            className="inline-block bg-charcoal text-white px-10 py-4 rounded-full font-bold tracking-widest hover:bg-gold transition-all"
          >
            START SHOPPING
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-12">
          <Link to="/shop" className="p-2 bg-white rounded-full hover:text-gold transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-4xl font-serif font-bold">Shopping <span className="text-gold">Bag</span></h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gold/10 flex flex-col sm:flex-row gap-6"
              >
                <div className="w-full sm:w-32 h-40 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-[10px] text-gold font-bold uppercase tracking-widest mb-1">{item.brand}</p>
                      <h3 className="text-xl font-serif font-bold text-charcoal">{item.name}</h3>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-6 line-clamp-2">{item.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center bg-cream rounded-full p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:text-gold transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:text-gold transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="text-xl font-serif font-bold text-charcoal">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-charcoal text-cream p-8 rounded-2xl shadow-xl sticky top-32">
              <h2 className="text-2xl font-serif font-bold mb-8 text-gold">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span>৳{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-xs text-gray-400">Calculated at checkout<br/>(Inside Dhaka ৳78 / Outside ৳118)</span>
                </div>
                <div className="border-t border-white/10 pt-4 flex justify-between text-xl font-bold">
                  <span>Subtotal</span>
                  <span className="text-gold">৳{cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <Link 
                to="/checkout"
                className="w-full bg-gold hover:bg-white hover:text-charcoal text-white py-4 rounded-full font-bold tracking-widest transition-all mb-4 flex items-center justify-center"
              >
                PROCEED TO CHECKOUT
              </Link>
              
              <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest">
                Secure SSL Encrypted Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
