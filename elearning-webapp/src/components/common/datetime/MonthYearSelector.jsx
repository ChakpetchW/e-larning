import React from 'react';

const MonthYearSelector = ({ view, viewDate, months, onMonthSelect, onYearSelect }) => {
  if (view === 'month') {
    return (
      <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {months.map((m, i) => (
          <button
            key={m}
            onClick={() => onMonthSelect(i)}
            className={`py-4 rounded-2xl text-sm font-black transition-all ${
              viewDate.getMonth() === i ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    );
  }

  if (view === 'year') {
    return (
      <div className="grid grid-cols-3 gap-3 h-[280px] overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-300 px-1">
        {Array.from({ length: 11 }).map((_, i) => {
          const year = new Date().getFullYear() + i - 2;
          return (
            <button
              key={year}
              onClick={() => onYearSelect(year)}
              className={`py-4 rounded-2xl text-sm font-black transition-all ${
                viewDate.getFullYear() === year ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {year + 543}
            </button>
          );
        })}
      </div>
    );
  }

  return null;
};

export default MonthYearSelector;
