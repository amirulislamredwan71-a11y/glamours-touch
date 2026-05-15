import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './hooks/useCart';
import { AuthProvider } from './hooks/useAuth';
import { UIProvider } from './hooks/useUI';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import FloatingCart from './components/FloatingCart';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import ScrollToTop from './components/ScrollToTop';
import WhatsAppButton from './components/WhatsAppButton';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import { useAuth } from './hooks/useAuth';
import { useUI } from './hooks/useUI';

const Shop = lazy(() => import('./pages/Shop'));
const Cart = lazy(() => import('./pages/Cart'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Checkout = lazy(() => import('./pages/Checkout'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const ReturnsExchanges = lazy(() => import('./pages/ReturnsExchanges'));
const FAQ = lazy(() => import('./pages/FAQ'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminCustomers = lazy(() => import('./pages/admin/Customers'));
const AdminBlogPosts = lazy(() => import('./pages/admin/BlogPosts'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));

const LoadingFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-cream">
    <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
  </div>
);

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-cream"><div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" /></div>;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  
  return <>{children}</>;
};

const AppContent = () => {
  const { isLoginOpen, closeLogin } = useUI();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <FloatingCart />
      <main className="flex-grow pb-16 sm:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Suspense fallback={<LoadingFallback />}><Shop /></Suspense>} />
          <Route path="/product/:id" element={<Suspense fallback={<LoadingFallback />}><ProductDetail /></Suspense>} />
          <Route path="/cart" element={<Suspense fallback={<LoadingFallback />}><Cart /></Suspense>} />
          <Route path="/profile" element={<Suspense fallback={<LoadingFallback />}><Profile /></Suspense>} />
          <Route path="/checkout" element={<Suspense fallback={<LoadingFallback />}><Checkout /></Suspense>} />
          <Route path="/about" element={<Suspense fallback={<LoadingFallback />}><About /></Suspense>} />
          <Route path="/contact" element={<Suspense fallback={<LoadingFallback />}><Contact /></Suspense>} />
          <Route path="/shipping" element={<Suspense fallback={<LoadingFallback />}><ShippingPolicy /></Suspense>} />
          <Route path="/returns" element={<Suspense fallback={<LoadingFallback />}><ReturnsExchanges /></Suspense>} />
          <Route path="/faq" element={<Suspense fallback={<LoadingFallback />}><FAQ /></Suspense>} />
          <Route path="/privacy" element={<Suspense fallback={<LoadingFallback />}><PrivacyPolicy /></Suspense>} />
          <Route path="/terms" element={<Suspense fallback={<LoadingFallback />}><TermsOfService /></Suspense>} />
          <Route path="/track-order" element={<Suspense fallback={<LoadingFallback />}><OrderTracking /></Suspense>} />
          <Route path="/blog" element={<Suspense fallback={<LoadingFallback />}><Blog /></Suspense>} />
          <Route path="/blog/:slug" element={<Suspense fallback={<LoadingFallback />}><BlogPost /></Suspense>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Suspense fallback={<LoadingFallback />}><AdminLogin /></Suspense>} />
          <Route path="/admin" element={<AdminRoute><Suspense fallback={<LoadingFallback />}><AdminLayout /></Suspense></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="blogs" element={<AdminBlogPosts />} />
          </Route>
        </Routes>
      </main>
      <Footer />
      <LoginModal isOpen={isLoginOpen} onClose={closeLogin} />
      <WhatsAppButton />
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <AuthProvider>
          <UIProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </UIProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
