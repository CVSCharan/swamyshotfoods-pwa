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
    default: 'bg-saffron-500/10 text-saffron-600 border border-saffron-500/20',
    secondary: 'bg-neutral-100 text-neutral-700 border border-neutral-200',
    destructive: 'bg-red-500/10 text-red-600 border border-red-500/25',
    outline: 'border border-neutral-300 text-neutral-500 bg-transparent',
    success: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/25',
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
