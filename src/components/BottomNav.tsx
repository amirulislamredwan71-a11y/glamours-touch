import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Menu } from 'lucide-react';

/** Official Messenger logo with brand gradient */
const MessengerIcon = ({ size = 19 }: { size?: number; className?: string }) => (
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

const WhatsAppIcon = ({ size = 19 }: { size?: number; className?: string }) => (
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
      className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 relative transition-all duration-300"
    >
      {({ isActive }) => (
        <div className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all duration-300 ${
          isActive 
            ? 'bg-gtgold/15 text-gtgold border border-gtgold/40 shadow-[0_0_12px_rgba(229,184,58,0.25)] scale-105' 
            : 'text-gray-400 hover:text-white'
        }`}>
          <Icon size={19} className={isActive ? 'text-gtgold drop-shadow-[0_0_6px_rgba(229,184,58,0.8)]' : 'text-gray-300'} />
          <span className={`text-[9.5px] font-black tracking-wider uppercase mt-0.5 ${isActive ? 'text-gtgold font-black' : 'text-gray-300 font-bold'}`}>{label}</span>
          {isActive && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-1 bg-gtgold rounded-full shadow-[0_0_6px_#e5b83a]" />}
        </div>
      )}
    </NavLink>
  );

  const ext = (href: string, Icon: React.ComponentType<{ size?: number; className?: string }>, label: string) => (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer" 
      aria-label={`Open ${label}`}
      className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 text-gray-300 active:scale-95 transition-all duration-200"
    >
      <div className="flex flex-col items-center justify-center w-full py-1 rounded-xl hover:bg-white/5">
        <Icon size={19} />
        <span className="text-[9.5px] font-extrabold tracking-wider uppercase text-gray-300 mt-0.5">{label}</span>
      </div>
    </a>
  );

  return (
    <>
      {/* Solid Dark Floor Mask — 100% seals bottom screen edge so no content peeks behind */}
      <div className="fixed bottom-0 left-0 right-0 h-10 bg-[#0b0e11] sm:hidden z-40 pointer-events-none" />

      {/* Floating Pill Capsule Dock — sits flush at bottom-0.5 with full 4-side gold border */}
      <nav className="fixed bottom-0.5 left-3 right-3 z-50 sm:hidden bg-[#0c1015]/98 backdrop-blur-2xl border border-gtgold/45 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.95)] px-2 py-1.5">
        <div className="flex items-center justify-between">
          {link('/', Home, 'Home', true)}
          {ext('https://m.me/1002146686323797', MessengerIcon, 'Messenger')}

          {/* Center — Flagship Floating AI Glow Orb */}
          <NavLink to="/glow-predictor" aria-label="AI Glow Predictor Studio" className="flex-1 flex flex-col items-center justify-center relative py-1 group">
            {({ isActive }) => (
              <div className="flex flex-col items-center justify-center -mt-5">
                <span className={`w-11 h-11 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.7)] ring-4 ring-[#0a0d11] transition-transform duration-300 group-active:scale-95 ${
                  isActive ? 'scale-110 ring-gtgold shadow-[0_0_25px_rgba(229,184,58,0.9)]' : ''
                }`} style={{ background: 'linear-gradient(135deg, #e5b83a 0%, #ec4899 50%, #8b5cf6 100%)' }}>
                  <span className="text-white font-black text-[11px] leading-none tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">AI</span>
                </span>
                <span className={`text-[8.5px] font-black tracking-widest mt-1 uppercase whitespace-nowrap px-1.5 py-0.5 rounded-full ${
                  isActive ? 'text-gtgold bg-gtgold/20 border border-gtgold/40 shadow-sm' : 'text-white/90 bg-black/60 border border-white/20'
                }`}>
                  GLOW AI
                </span>
              </div>
            )}
          </NavLink>

          {ext('https://wa.me/8801712426871', WhatsAppIcon, 'WhatsApp')}

          {/* 5th Item: MENU Drawer Button (3-Line Hamburger Icon) */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('gt-toggle-menu'))}
            aria-label="Open Navigation Menu"
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 text-gray-300 active:scale-95 transition-all duration-200"
          >
            <div className="flex flex-col items-center justify-center w-full py-1 rounded-xl hover:bg-gtgold/15 hover:text-gtgold">
              <Menu size={19} className="text-gtgold" />
              <span className="text-[9.5px] font-black tracking-wider uppercase text-gtgold mt-0.5">MENU</span>
            </div>
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
