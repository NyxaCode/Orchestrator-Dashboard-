import React from 'react';
import { cn } from '../../lib/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', icon, children, disabled, ...props }, ref) => {
    const baseStyle =
      'inline-flex items-center justify-center gap-2 font-medium transition-[transform,opacity,background-color,border-color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none active:scale-[0.97] hover:-translate-y-0.5 cursor-pointer select-none';

    const sizeStyles = {
      sm: 'text-xs px-2.5 py-1.5 rounded-[6px] h-7',
      md: 'text-xs px-3.5 py-2 rounded-[8px] h-9',
      lg: 'text-sm px-4 py-2.5 rounded-[8px] h-10',
    };

    const variantStyles = {
      primary:
        'bg-[#dc2626] hover:bg-[#b91c1c] text-white shadow-sm border border-red-500/30',
      secondary:
        'bg-[#161e28] hover:bg-[#1a232e] text-[#f3f4f6] border border-white/10 hover:border-white/20',
      outline:
        'bg-transparent hover:bg-white/5 text-[#f3f4f6] border border-white/15 hover:border-white/30',
      ghost:
        'bg-transparent hover:bg-white/5 text-[#9ca3af] hover:text-[#f3f4f6] border border-transparent',
      danger:
        'bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyle, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {children && <span className="truncate">{children}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
