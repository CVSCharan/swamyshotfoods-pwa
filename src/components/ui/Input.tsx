import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  leftIcon?: LucideIcon;
  multiline?: boolean;
  numberOfLines?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon: LeftIcon,
  multiline = false,
  numberOfLines = 3,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const baseInputStyle = `w-full px-4 py-3 glass-input rounded-xl text-sm placeholder-neutral-400 focus:ring-2 focus:ring-saffron-500/20 transition-all duration-200 ${
    LeftIcon ? 'pl-11' : ''
  } ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''} ${className}`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-neutral-700 font-display tracking-wide uppercase"
        >
          {label}
        </label>
      )}
      
      <div className="relative w-full">
        {LeftIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
            <LeftIcon size={18} />
          </div>
        )}
        
        {multiline ? (
          <textarea
            id={inputId}
            rows={numberOfLines}
            className={`${baseInputStyle} resize-none py-3`}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={inputId}
            className={baseInputStyle}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>
      
      {error && (
        <span className="text-xs text-red-500 font-medium mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
};
