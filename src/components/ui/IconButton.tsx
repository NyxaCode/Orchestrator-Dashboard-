import React from 'react';
import { cn } from '../../lib/cn';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  variant?: 'secondary' | 'ghost' | 'outline' | 'accent';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'ghost', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyle =
      'inline-flex items-center justify-center shrink-0 rounded-full transition-[transform,opacity,background-color,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14] disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none active:scale-[0.95] hover:-translate-y-0.5 cursor-pointer';

    const sizeStyles = {
      sm: 'w-7 h-7 min-w-[28px] min-h-[28px] text-xs',
      md: 'w-9 h-9 min-w-[36px] min-h-[36px] text-sm',
      lg: 'w-11 h-11 min-w-[44px] min-h-[44px] text-base',
    };

    const variantStyles = {
      secondary: 'bg-[#161e28] hover:bg-[#1a232e] text-[#f3f4f6] border border-white/10',
      ghost: 'bg-transparent hover:bg-white/10 text-[#9ca3af] hover:text-[#f3f4f6]',
      outline: 'bg-transparent hover:bg-white/5 text-[#f3f4f6] border border-white/15',
      accent: 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyle, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
