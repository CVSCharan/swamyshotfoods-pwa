import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Card } from './Card';

interface ModalProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onDismiss,
  title,
  children,
  className = '',
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onDismiss}
      />
      
      {/* Modal Container */}
      <Card
        className={`relative w-full max-w-lg shadow-2xl z-10 animate-slide-up border border-stone-800/80 max-h-[85vh] flex flex-col ${className}`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800/60 shrink-0">
          {title ? (
            <h3 className="font-display text-lg font-bold text-stone-100 tracking-tight">
              {title}
            </h3>
          ) : (
            <div />
          )}
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-5 overflow-y-auto min-h-0 flex-1">
          {children}
        </div>
      </Card>
    </div>
  );
};
