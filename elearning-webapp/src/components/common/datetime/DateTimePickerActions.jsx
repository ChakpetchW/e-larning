import React from 'react';
import { Check } from 'lucide-react';

const DateTimePickerActions = ({ onClear, onApply }) => {
  return (
    <div className="flex items-center gap-3 p-6 bg-slate-50 border-t border-slate-100">
      <button 
        onClick={onClear}
        className="px-6 py-4 text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
      >
        ล้างวัน
      </button>
      <button 
        onClick={onApply}
        className="flex-1 flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 active:scale-95 transition-all"
      >
        <Check size={18} /> ยืนยันกำหนดการ
      </button>
    </div>
  );
};

export default DateTimePickerActions;
