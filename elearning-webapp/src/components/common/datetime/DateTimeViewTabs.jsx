import React from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

const DateTimeViewTabs = ({ view, setView, showTime }) => {
  return (
    <div className="flex p-3 gap-2 bg-slate-50/50 border-b border-slate-100">
      <button 
        onClick={() => setView('calendar')}
        className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-2xl text-sm font-black transition-all ${
          (view === 'calendar' || view === 'month' || view === 'year') ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <CalendarIcon size={16} /> วันที่
      </button>
      {showTime && (
        <button 
          onClick={() => setView('time')}
          className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-2xl text-sm font-black transition-all ${
            view === 'time' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Clock size={16} /> เวลา
        </button>
      )}
    </div>
  );
};

export default DateTimeViewTabs;
