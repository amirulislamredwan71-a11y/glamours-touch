import React from 'react';

const Logo = ({ className = "w-12 h-12" }: { className?: string }) => {
  return (
    <img
      src="/logo.png"
      alt="Glamour's Touch — Korean Skincare Bangladesh"
      className={`object-contain ${className}`}
      loading="eager"
    />
  );
};

export default Logo;
