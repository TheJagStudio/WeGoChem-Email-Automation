import React, { useState, useEffect } from 'react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  // PostHog buttons: often distinct borders, slightly rounded, fontWeight bold.
  const baseStyles = "inline-flex items-center justify-center rounded-[4px] font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:translate-y-[1px]";
  
  const variants = {
    // Primary: Yellow with black text (WeGoChem brand) but structurally bold
    primary: "bg-brand-yellow text-brand-black border border-yellow-500 hover:bg-[#FDD815] shadow-sm",
    // Secondary: PostHog Blue style
    secondary: "bg-ph-blue text-white border border-blue-700 hover:bg-blue-600 shadow-sm",
    // Outline: White with gray border
    outline: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm",
    // Ghost: Transparent
    ghost: "bg-transparent text-gray-600 hover:bg-black/5 hover:text-gray-900",
    // Danger: Red
    danger: "bg-red-600 text-white border border-red-700 hover:bg-red-700 shadow-sm"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

// --- Card ---
// PostHog Cards: White, thin distinct border, minimal shadow
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`bg-white rounded-lg border border-ph-border shadow-ph ${className}`} {...props}>
    {children}
  </div>
);

// --- Badge ---
// PostHog Badges: Clean pills
export const Badge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    hot: "bg-orange-100 text-orange-700 border-orange-200",
    new: "bg-blue-100 text-blue-700 border-blue-200",
    engaged: "bg-green-100 text-green-700 border-green-200",
    nurture: "bg-yellow-100 text-yellow-700 border-yellow-200",
    converted: "bg-purple-100 text-purple-700 border-purple-200",
    cold: "bg-gray-100 text-gray-700 border-gray-200",
    running: "bg-green-50 text-green-700 border-green-200",
    draft: "bg-gray-100 text-gray-600 border-gray-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
    paused: "bg-orange-50 text-orange-700 border-orange-200",
  };

  const defaultStyle = "bg-gray-100 text-gray-600 border-gray-200";
  const normalizedStatus = status.toLowerCase();

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize border ${styles[normalizedStatus] || defaultStyle}`}>
      {status}
    </span>
  );
};

// --- Input ---
// PostHog Inputs: White, border-gray-300, distinct focus ring
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input 
    className={`block w-full rounded border-gray-300 bg-white shadow-sm focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow sm:text-sm p-2 transition-colors placeholder:text-gray-400 ${className}`} 
    {...props} 
  />
);

// --- Metric Card ---
export const MetricCard: React.FC<{ label: string; value: string | number; change?: string; trend?: 'up' | 'down' | 'neutral' }> = ({ label, value, change, trend }) => (
  <Card className="p-5 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
    <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{label}</dt>
    <div className="mt-4 flex items-end justify-between">
        <dd className="text-3xl font-bold tracking-tight text-gray-900">{value}</dd>
        {change && (
        <div className={`flex items-center text-sm font-bold ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'} {change}
        </div>
        )}
    </div>
  </Card>
);

// --- Modal ---
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
           <h3 className="font-bold text-lg text-gray-900">{title}</h3>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
        </div>
        <div className="p-6">
            {children}
        </div>
      </div>
    </div>
  );
};

// --- Toast System ---
export const toastEvent = new EventTarget();

export const toast = {
  success: (message: string) => toastEvent.dispatchEvent(new CustomEvent('toast', { detail: { message, type: 'success' } })),
  error: (message: string) => toastEvent.dispatchEvent(new CustomEvent('toast', { detail: { message, type: 'error' } })),
  info: (message: string) => toastEvent.dispatchEvent(new CustomEvent('toast', { detail: { message, type: 'info' } })),
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: 'success' | 'error' | 'info' }>>([]);

  useEffect(() => {
    const handler = (e: any) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, ...e.detail }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    };

    toastEvent.addEventListener('toast', handler);
    return () => toastEvent.removeEventListener('toast', handler);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <div 
          key={t.id} 
          className={`px-4 py-3 rounded border shadow-lg text-sm font-bold animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto flex items-center min-w-[300px]
            ${t.type === 'success' ? 'bg-white border-green-500 text-green-700' : 
              t.type === 'error' ? 'bg-white border-red-500 text-red-700' : 'bg-brand-black border-gray-800 text-white'}`}
        >
          {t.type === 'success' && <span className="mr-2 text-xl">✓</span>}
          {t.type === 'error' && <span className="mr-2 text-xl">✕</span>}
          {t.type === 'info' && <span className="mr-2 text-xl">ℹ</span>}
          {t.message}
        </div>
      ))}
    </div>
  );
};