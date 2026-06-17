'use client';

import { useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const isError   = type === 'error';
  const accentCol = isError ? '#DC2626' : '#F5C24C';
  const Icon      = isError ? AlertCircle : Check;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
      <div
        className="flex items-center gap-3 bg-[#2D1B69] px-5 py-3 shadow-2xl border"
        style={{ borderColor: accentCol }}
      >
        <div
          className="w-5 h-5 flex items-center justify-center shrink-0"
          style={{ backgroundColor: accentCol }}
        >
          <Icon className="w-3 h-3 text-[#2D1B69]" />
        </div>
        <span className="text-xs text-[#FFFDE7] uppercase tracking-[0.25em]">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-[#8B72BE] hover:text-[#FFFDE7] text-xs transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  );
}
