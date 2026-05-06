import React, { useState } from 'react';

const Logo = ({ className = "w-12 h-12" }: { className?: string }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div
        className={`bg-black rounded flex items-center justify-center overflow-hidden flex-shrink-0 ${className}`}
        style={{ aspectRatio: '1' }}
      >
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontWeight: 700,
            fontSize: 'clamp(8px, 2.5vw, 18px)',
            color: '#c9a84c',
            textAlign: 'center',
            lineHeight: 1.1,
            letterSpacing: '0.05em',
          }}
        >
          GT
        </span>
      </div>
    );
  }

  return (
    <picture className={`flex-shrink-0 ${className}`}>
      {/* WebP — Android Chrome, Samsung Browser, all modern browsers */}
      <source srcSet="/logo.webp" type="image/webp" />
      {/* PNG — fallback for older browsers */}
      <img
        src="/logo.png"
        alt="Glamour's Touch — Korean Skincare Bangladesh"
        className={`object-contain w-full h-full flex-shrink-0`}
        loading="eager"
        decoding="async"
        onError={() => setImgError(true)}
      />
    </picture>
  );
};

export default Logo;
