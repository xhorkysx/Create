import React from 'react';

export function CEPROLogo() {
  return (
    <div className="flex items-center justify-center mb-4">
      <img 
        src="/logo.png" 
        alt="Logo" 
        className="h-20 w-auto"
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