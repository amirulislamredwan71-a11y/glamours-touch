import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './hooks/useCart';
import { AuthProvider } from './hooks/useAuth';
import { UIProvider } from './hooks/useUI';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import FloatingCart from './components/FloatingCart';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';
import ShippingPolicy from './pages/ShippingPolicy';
import ReturnsExchanges from './pages/ReturnsExchanges';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminOrders from './pages/admin/Orders';
import AdminCustomers from './pages/admin/Customers';
import AdminLogin from './pages/admin/Login';
import { useAuth } from './hooks/useAuth';
import { useUI } from './hooks/useUI';
import { Navigate } from 'react-router-dom';

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
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shipping" element={<ShippingPolicy />} />
          <Route path="/returns" element={<ReturnsExchanges />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
          </Route>
        </Routes>
      </main>
      <Footer />
      <LoginModal isOpen={isLoginOpen} onClose={closeLogin} />
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
