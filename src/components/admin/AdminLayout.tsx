import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Users, 
  ShoppingBag, 
  LogOut,
  Menu,
  X,
  Home,
  FileText,
  Star
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Blog Posts', path: '/admin/blogs', icon: FileText },
    { name: 'Flash Banners', path: '/admin/banners', icon: Tags },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 w-64 bg-charcoal text-white z-50 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-white/5">
            <Link to="/" className="text-xl font-serif font-bold text-gold flex items-center gap-2">
              <ShoppingBag size={24} />
              Glamour Admin
            </Link>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="flex-grow px-4 space-y-2 mt-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive ? 'bg-gold text-charcoal shadow-lg shadow-gold/20' : 'hover:bg-white/10 text-gray-400 hover:text-white'}
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10 space-y-2">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all font-medium"
            >
              <Home size={20} />
              View Website
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all font-medium"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-6 sticky top-0 z-30">
          <button 
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-charcoal"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-none mb-1">{user?.user_metadata?.full_name || 'Admin'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'admin@glamourstouch.com'}</p>
            </div>
            <div className="w-10 h-10 bg-gold/10 text-gold rounded-full flex items-center justify-center font-bold border border-gold/20">
              {(user?.email?.[0] || 'A').toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-10 pb-28 lg:pb-10">
          <Outlet />
        </div>

        {/* Admin Mobile Bottom App Bar (Only on smartphones) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 px-2 py-2 flex items-center justify-around shadow-lg">
          <Link 
            to="/admin" 
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              location.pathname === '/admin' ? 'text-gold font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="text-[10px]">Dashboard</span>
          </Link>
          <Link 
            to="/admin/orders" 
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              location.pathname === '/admin/orders' ? 'text-gold font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ShoppingBag size={20} />
            <span className="text-[10px]">Orders</span>
          </Link>
          <Link 
            to="/admin/products" 
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              location.pathname === '/admin/products' ? 'text-gold font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Package size={20} />
            <span className="text-[10px]">Products</span>
          </Link>
          <Link 
            to="/admin/categories" 
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              location.pathname === '/admin/categories' ? 'text-gold font-bold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Tags size={20} />
            <span className="text-[10px]">Categories</span>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-gray-500 hover:text-gold transition-all"
          >
            <Menu size={20} />
            <span className="text-[10px]">Menu</span>
          </button>
        </nav>
      </main>
    </div>
  );
};

export default AdminLayout;
