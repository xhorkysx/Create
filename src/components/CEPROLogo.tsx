import React, { useEffect, useRef } from 'react';

export function CEPROLogo() {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Generuj náhodný delay mezi 0 a 12 sekundami
    const randomDelay = Math.random() * 12;
    
    if (imgRef.current) {
      imgRef.current.style.setProperty('--animation-delay', randomDelay.toString());
    }
  }, []);

  return (
    <div className="flex items-center justify-center">
      <img 
        ref={imgRef}
        src="/logo.png" 
        alt="Logo" 
        className="h-20 w-auto logo-animated"
        style={{ 
          maxWidth: 'none', 
          maxHeight: 'none',
          width: 'auto',
          height: '5rem',
          display: 'block'
        }}
      />
    </div>
  );
}