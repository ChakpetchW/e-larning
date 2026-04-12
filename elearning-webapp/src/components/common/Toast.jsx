import React from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onRemove={() => onRemove(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem = ({ message, type, onRemove }) => {
  const config = {
    success: {
      icon: <CheckCircle className="text-success" size={18} />,
      bg: 'bg-success-bg border-success-border',
      text: 'text-success-text',
    },
    error: {
      icon: <XCircle className="text-danger" size={18} />,
      bg: 'bg-danger-bg border-danger-border',
      text: 'text-danger-text',
    },
    warning: {
      icon: <AlertTriangle className="text-warning" size={18} />,
      bg: 'bg-warning-bg border-warning-border',
      text: 'text-warning-text',
    },
    info: {
      icon: <Info className="text-info" size={18} />,
      bg: 'bg-info-bg border-info-border',
      text: 'text-info-text',
    },
  }[type] || config.info;

  return (
    <div className={`
      flex items-center gap-3 p-4 rounded-2xl border shadow-lg 
      animate-in slide-in-from-right-full fade-in duration-300 
      pointer-events-auto min-w-[300px] max-w-md
      ${config.bg} ${config.text}
    `}>
      <div className="shrink-0">
        {config.icon}
      </div>
      <div className="flex-1 text-sm font-bold">
        {message}
      </div>
      <button 
        onClick={onRemove}
        className="p-1 hover:bg-black/5 rounded-lg transition-colors"
      >
        <X size={14} className="opacity-50" />
      </button>
    </div>
  );
};
