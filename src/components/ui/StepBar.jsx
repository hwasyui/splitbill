'use client';

import { Check } from 'lucide-react';

export default function StepBar({ current }) {
  const steps = ['Upload', 'Review', 'Assign', 'Summary'];
  const items = [];
  steps.forEach((label, i) => {
    const n      = i + 1;
    const active = n === current;
    const done   = n < current;
    items.push(
      <div key={`s${i}`} className="flex flex-col items-center gap-1">
        <div className={`w-8 h-8 flex items-center justify-center text-xs font-bold border-2 transition-colors
          ${active ? 'bg-[#F5C24C] border-[#F5C24C] text-[#2D1B69]'
          : done   ? 'bg-[#2D1B69] border-[#2D1B69] text-[#FFFDE7]'
          :          'border-[#DDD0FF] text-[#8B72BE]'}`}>
          {done ? <Check className="w-3.5 h-3.5" /> : String(n).padStart(2, '0')}
        </div>
        <span className={`text-[9px] uppercase tracking-[0.2em] transition-colors
          ${active ? 'text-[#F5C24C]' : done ? 'text-[#2D1B69]' : 'text-[#8B72BE]'}`}>
          {label}
        </span>
      </div>
    );
    if (i < 3) {
      items.push(
        <div key={`l${i}`} className={`flex-1 h-px mb-5 transition-colors ${n < current ? 'bg-[#F5C24C]' : 'bg-[#DDD0FF]'}`} />
      );
    }
  });
  return <div className="flex items-center mb-8">{items}</div>;
}
