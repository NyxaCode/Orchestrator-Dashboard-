import React from 'react';

interface HatchStripProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const HatchStrip: React.FC<HatchStripProps> = ({
  className = '',
  width = 64,
  height = 12,
}) => {
  return (
    <div
      className={`pointer-events-none opacity-30 select-none ${className}`}
      style={{
        width,
        height,
        backgroundImage:
          'repeating-linear-gradient(135deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 1px, transparent 1px, transparent 4px)',
      }}
      aria-hidden="true"
    />
  );
};
