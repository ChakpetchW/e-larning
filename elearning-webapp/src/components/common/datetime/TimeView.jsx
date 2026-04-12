import React from 'react';
import { Timer } from 'lucide-react';

const TimeView = ({ hours, setHours, minutes, setMinutes }) => {
  return (
    <div className="flex flex-col items-center gap-10 py-4 scale-110">
      <div className="flex items-center gap-6">
        {/* Hours */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ชั่วโมง</span>
          <div className="flex flex-col h-56 w-20 overflow-y-auto no-scrollbar snap-y snap-mandatory border border-slate-100 rounded-[1.5rem] bg-slate-50 shadow-inner">
            {Array.from({ length: 24 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setHours(i)}
                className={`h-14 shrink-0 flex items-center justify-center text-lg font-black snap-center transition-all ${
                  hours === i ? 'bg-slate-900 text-white active:scale-90' : 'text-slate-400 hover:bg-slate-200'
                }`}
              >
                {i.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
        
        <div className="text-3xl font-black text-slate-300 self-end mb-4">:</div>
        
        {/* Minutes */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">นาที</span>
          <div className="flex flex-col h-56 w-20 overflow-y-auto no-scrollbar snap-y snap-mandatory border border-slate-100 rounded-[1.5rem] bg-slate-50 shadow-inner">
            {Array.from({ length: 60 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setMinutes(i)}
                className={`h-14 shrink-0 flex items-center justify-center text-lg font-black snap-center transition-all ${
                  minutes === i ? 'bg-slate-900 text-white active:scale-90' : 'text-slate-400 hover:bg-slate-200'
                }`}
              >
                {i.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 px-6 py-3 bg-amber-50 rounded-2xl border border-amber-100 shadow-sm transition-all focus-within:ring-4 focus-within:ring-amber-400/20">
        <Timer size={20} className="text-amber-500" />
        <div className="flex items-baseline gap-1">
          <input 
            type="number"
            min="0"
            max="23"
            value={hours.toString().padStart(2, '0')}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 0 && val <= 23) setHours(val);
            }}
            className="w-12 bg-transparent text-xl font-black text-amber-900 border-none outline-none text-center focus:bg-white/50 rounded-lg"
          />
          <span className="text-xl font-black text-amber-900/40">:</span>
          <input 
            type="number"
            min="0"
            max="59"
            value={minutes.toString().padStart(2, '0')}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 0 && val <= 59) setMinutes(val);
            }}
            className="w-12 bg-transparent text-xl font-black text-amber-900 border-none outline-none text-center focus:bg-white/50 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default TimeView;
