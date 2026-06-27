import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-display font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-500/50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer';
  
  const variants = {
    primary: 'bg-gold-500 hover:bg-gold-400 text-stone-950 shadow-[0_4px_20px_rgba(244,196,48,0.25)] hover:shadow-[0_4px_24px_rgba(244,196,48,0.4)]',
    secondary: 'bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700',
    outline: 'border border-gold-500/50 hover:border-gold-500 bg-transparent text-gold-500 hover:bg-gold-500/5',
    ghost: 'bg-transparent hover:bg-stone-800 text-stone-300 hover:text-stone-100',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.25)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
};
