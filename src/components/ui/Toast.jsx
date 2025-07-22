'use client';

import { useEffect } from 'react';

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-purple-600 text-white shadow-xl rounded-lg px-6 py-3 text-center text-sm sm:text-base font-medium animate-slide-down">
        {message}
      </div>
    </div>
  );
}
