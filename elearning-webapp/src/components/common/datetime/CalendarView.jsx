import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toThaiYear } from '../../../utils/dateUtils';

const CalendarView = ({ 
  viewDate, 
  calendarDays, 
  daysOfWeek, 
  months, 
  onPrevMonth, 
  onNextMonth, 
  onViewMonthSelect, 
  onViewYearSelect, 
  onDateClick, 
  isSelected, 
  isToday 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <button onClick={onPrevMonth} className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <button 
            onClick={onViewMonthSelect}
            className="text-lg font-black text-slate-900 hover:bg-amber-50 px-3 py-1 rounded-lg transition-colors"
          >
            {months[viewDate.getMonth()]}
          </button>
          <button 
            onClick={onViewYearSelect}
            className="text-lg font-black text-slate-900 hover:bg-amber-50 px-3 py-1 rounded-lg transition-colors"
          >
            {toThaiYear(viewDate)}
          </button>
        </div>
        <button onClick={onNextMonth} className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors">
          <ChevronRight size={24} />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {daysOfWeek.map(d => (
          <div key={d} className="text-center text-xs font-black text-slate-300 uppercase py-2 tracking-widest">{d}</div>
        ))}
        {calendarDays.map((d, i) => (
          <div key={i} className="aspect-square flex items-center justify-center">
            {d.day && (
              <button
                onClick={() => onDateClick(d.day)}
                className={`h-11 w-11 text-sm font-black rounded-2xl transition-all ${
                  isSelected(d.day) 
                    ? 'bg-slate-900 text-white shadow-xl scale-110' 
                    : isToday(d.day)
                      ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400 ring-inset'
                      : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {d.day}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
