'use client';

import { TypeAnimation } from 'react-type-animation';

export default function Loader({ message = "Processing..." }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D1B69]/90 backdrop-blur-sm">
      <div className="border border-[#1E1245] bg-[#1E1245] p-8 max-w-xs w-full mx-4">
        {/* Terminal header */}
        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-[#3D2B7A]">
          <div className="w-2 h-2 bg-[#DC2626]" />
          <div className="w-2 h-2 bg-[#F5C24C]" />
          <div className="w-2 h-2 bg-[#16A34A]" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#8B72BE] ml-2">Angelica's Split Bill</span>
        </div>

        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div
            className="w-10 h-10 border-2 border-[#3D2B7A] border-t-[#F5C24C] animate-spin"
            style={{ borderRadius: 0 }}
          />
        </div>

        {/* Typing message */}
        <div className="text-center">
          <TypeAnimation
            sequence={[message, 2000, '...', 500]}
            speed={60}
            repeat={Infinity}
            wrapper="p"
            className="text-xs text-[#8B72BE] uppercase tracking-[0.25em]"
          />
          <span className="inline-block w-2 h-3.5 bg-[#F5C24C] animate-termBlink ml-0.5 align-middle" />
        </div>
      </div>
    </div>
  );
}
