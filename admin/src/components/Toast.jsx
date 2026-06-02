import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColors = {
    success: 'bg-emerald-950/80 border-emerald-500/30 text-emerald-200',
    error: 'bg-rose-950/80 border-rose-500/30 text-rose-200',
    info: 'bg-sky-950/80 border-sky-500/30 text-sky-200',
  };

  const Icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
  };

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-md shadow-2xl transition-all duration-300 animate-slide-in ${bgColors[type]}`}>
      {Icons[type]}
      <p className="text-sm font-medium pr-2">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition">
        <X className="w-4 h-4 opacity-70 hover:opacity-100" />
      </button>
    </div>
  );
}
