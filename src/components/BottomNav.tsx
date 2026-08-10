import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Truck } from 'lucide-react';

/** Official Messenger logo with brand gradient (lucide has no Messenger glyph). */
const MessengerIcon = ({ size = 18 }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="gt-messenger-grad" cx="0.5" cy="0.99" r="1.1">
        <stop offset="0" stopColor="#0099FF" />
        <stop offset="0.6" stopColor="#A033FF" />
        <stop offset="0.9" stopColor="#FF5280" />
        <stop offset="1" stopColor="#FF7061" />
      </radialGradient>
    </defs>
    <path d="M18 0C7.9 0 0 7.4 0 17.4c0 5.24 2.15 9.77 5.65 12.9.29.26.47.63.48 1.02l.1 3.2c.03 1.02 1.08 1.68 2.01 1.27l3.57-1.57c.3-.13.63-.16.95-.08 1.64.45 3.39.69 5.24.69 10.1 0 18-7.4 18-17.4S28.1 0 18 0z" fill="url(#gt-messenger-grad)" />
    <path d="M7.19 22.56l5.29-8.39c.84-1.33 2.64-1.66 3.9-.71l4.2 3.15c.39.29.91.29 1.3 0l5.68-4.31c.76-.58 1.75.33 1.24 1.14l-5.29 8.39c-.84 1.33-2.64 1.66-3.9.71l-4.2-3.15a1.09 1.09 0 00-1.3 0l-5.68 4.31c-.76.58-1.75-.33-1.24-1.14z" fill="#fff" />
  </svg>
);

const WhatsAppIcon = ({ size = 18 }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.97L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.2c-.24.68-1.42 1.32-1.95 1.36-.5.05-.96.23-3.23-.67-2.72-1.07-4.44-3.85-4.57-4.03-.13-.18-1.1-1.46-1.1-2.79 0-1.33.7-1.98.95-2.25.24-.27.53-.34.7-.34.18 0 .35 0 .5.01.16.01.38-.06.59.45.24.58.8 2 .87 2.14.07.14.12.31.02.49-.09.18-.14.29-.27.45-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.27.72 1.19 1.55 1.93 1.07.95 1.97 1.25 2.25 1.39.27.14.43.12.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.55.73 1.81.87.27.14.45.2.51.31.07.12.07.66-.17 1.34z" />
  </svg>
);

const BottomNav = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;

  const link = (to: string, Icon: React.ComponentType<{ size?: number; className?: string }>, label: string, end = false) => (
    <NavLink
      to={to}
      end={end}
      className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative"
    >
      {({ isActive }) => (
        <>
          <Icon size={18} className={isActive ? 'text-gtgold' : 'text-white/50'} />
          <span className={`text-[9px] font-bold tracking-wide uppercase ${isActive ? 'text-gtgold' : 'text-white/50'}`}>{label}</span>
          {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-gtgold rounded-full" />}
        </>
      )}
    </NavLink>
  );

  const ext = (href: string, Icon: React.ComponentType<{ size?: number; className?: string }>, label: string) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-white/50 active:text-gtgold transition-colors">
      <Icon size={18} />
      <span className="text-[9px] font-bold tracking-wide uppercase text-white/50">{label}</span>
    </a>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-[#050507] border-t border-white/8 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <div className="flex items-stretch">
        {link('/', Home, 'Home', true)}
        {ext('https://m.me/1002146686323797', MessengerIcon, 'Messenger')}

        {/* Center — flagship Glow Predictor, raised */}
        <NavLink to="/glow-predictor" className="flex-1 flex flex-col items-center justify-end pb-1.5 relative">
          {({ isActive }) => (
            <>
              <span className="-mt-4 w-11 h-11 rounded-full flex items-center justify-center shadow-md border-2 border-[#050507]" style={{ background: 'linear-gradient(135deg,#ff2a6d,#9a0036)' }}>
                <span className="text-white font-black text-sm leading-none tracking-tight">AI</span>
              </span>
              <span className={`text-[8.5px] font-black tracking-tight mt-0.5 whitespace-nowrap ${isActive ? 'text-gtgold' : 'text-white/60'}`}>গ্লো প্রেডিকশন</span>
            </>
          )}
        </NavLink>

        {ext('https://wa.me/8801712426871', WhatsAppIcon, 'WhatsApp')}
        {link('/track-order', Truck, 'Track')}
      </div>
    </nav>
  );
};

export default BottomNav;
