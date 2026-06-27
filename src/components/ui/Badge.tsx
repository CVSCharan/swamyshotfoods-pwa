import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-display tracking-wide uppercase transition-colors duration-150';
  
  const variants = {
    default: 'bg-gold-500/10 text-gold-500 border border-gold-500/20', // Admin gold
    secondary: 'bg-stone-800 text-stone-300 border border-stone-700', // Staff grey
    destructive: 'bg-red-500/10 text-red-500 border border-red-500/25', // Closed red
    outline: 'border border-stone-700 text-stone-400 bg-transparent', // Offline
    success: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/25', // Open green
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
