import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function Modal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Sil', cancelText = 'İptal', type = 'danger' }) {
  if (!isOpen) return null;

  const confirmColors = {
    danger: 'bg-rose-700 hover:bg-rose-600 focus:ring-rose-500',
    primary: 'bg-burgundy hover:bg-burgundy-light focus:ring-burgundy',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#1e1e1e] text-[#f5f0eb] shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {type === 'danger' && <AlertTriangle className="w-5 h-5 text-rose-500" />}
            {title}
          </h3>
          <button onClick={onCancel} className="p-1 hover:bg-white/5 rounded transition">
            <X className="w-4 h-4 opacity-70 hover:opacity-100" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-sm opacity-90 leading-relaxed">
          {message}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 bg-black/20 border-t border-white/5">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 hover:bg-white/10 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1e1e1e] ${confirmColors[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
