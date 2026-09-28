import React from 'react';

export const HudCorners: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`pointer-events-none absolute inset-0 z-10 ${className}`} aria-hidden="true">
      {/* Top Left */}
      <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t border-l border-white/20" />
      {/* Top Right */}
      <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t border-r border-white/20" />
      {/* Bottom Left */}
      <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b border-l border-white/20" />
      {/* Bottom Right */}
      <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b border-r border-white/20" />
    </div>
  );
};
