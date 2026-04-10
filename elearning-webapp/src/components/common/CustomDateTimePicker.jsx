import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, X, Check, Timer } from 'lucide-react';
import { formatThaiDateTime } from '../../utils/dateUtils';
import ModalPortal from '../common/ModalPortal';

const CustomDateTimePicker = ({ value, onChange, label = 'กำหนดวันและเวลาหมดอายุ (พ.ศ.)', showTime = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('calendar'); // 'calendar', 'time', 'month', 'year'
  
  // Date logic
  const initialDate = value ? new Date(value) : new Date();
  const [viewDate, setViewDate] = useState(new Date(initialDate));
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  
    // Time logic
    const [hours, setHours] = useState(selectedDate ? selectedDate.getHours() : 23);
    const [minutes, setMinutes] = useState(selectedDate ? selectedDate.getMinutes() : 59);
  
    const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const daysOfWeek = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Padding for start of month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null, currentMonth: false });
    }
    
    // Days in current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, currentMonth: true });
    }
    
    return days;
  }, [viewDate]);

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleMonthSelect = (monthIdx) => {
    setViewDate(new Date(viewDate.getFullYear(), monthIdx, 1));
    setView('calendar');
  };

  const handleYearSelect = (year) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setView('calendar');
  };

    const handleDateClick = (day) => {
      const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      newDate.setHours(hours);
      newDate.setMinutes(minutes);
      setSelectedDate(newDate);
      
      if (showTime) {
        setView('time'); // Switch to time selection if enabled
      } else {
        // Date only mode: Close and update immediately
        updateValue(newDate);
        setIsOpen(false);
      }
    };

  const handleApply = () => {
    if (!selectedDate) {
      // If nothing selected, pick today with current time settings
      const today = new Date();
      today.setHours(hours);
      today.setMinutes(minutes);
      updateValue(today);
    } else {
      const finalDate = new Date(selectedDate);
      finalDate.setHours(hours);
      finalDate.setMinutes(minutes);
      updateValue(finalDate);
    }
    setIsOpen(false);
  };

    const updateValue = (date) => {
      const pad = (n) => n.toString().padStart(2, '0');
      const yyyy = date.getFullYear();
      const mm = pad(date.getMonth() + 1);
      const dd = pad(date.getDate());
      
      if (showTime) {
        const hh = pad(hours);
        const min = pad(minutes);
        const isoString = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
        onChange({ target: { value: isoString } });
      } else {
        const dateString = `${yyyy}-${mm}-${dd}`;
        onChange({ target: { value: dateString } });
      }
    };

  const handleClear = () => {
    onChange({ target: { value: '' } });
    setSelectedDate(null);
    setIsOpen(false);
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      viewDate.getMonth() === today.getMonth() &&
      viewDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    return (
      selectedDate &&
      day === selectedDate.getDate() &&
      viewDate.getMonth() === selectedDate.getMonth() &&
      viewDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 ml-1">
        <Clock size={14} className="text-amber-600" />
        <label className="text-[10px] font-black uppercase tracking-widest text-amber-900/60">{label}</label>
      </div>
      
      <div 
        onClick={() => setIsOpen(true)}
        className="group relative cursor-pointer"
      >
        <div className="flex w-full items-center justify-between rounded-2xl border border-amber-200/60 bg-white/90 px-5 py-4 shadow-inner transition-all group-hover:border-amber-400 group-hover:ring-4 group-hover:ring-amber-400/5">
          <span className="text-sm font-black text-slate-800">
            {value ? formatThaiDateTime(value, showTime) : `คลิกเพื่อกำหนดวัน${showTime ? 'และเวลา' : ''}...`}
          </span>
          <CalendarIcon size={18} className="text-amber-500/50 group-hover:text-amber-500 transition-colors" />
        </div>
      </div>

      <ModalPortal isOpen={isOpen}>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div 
            className="absolute inset-0 bg-slate-950/40" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white shadow-[0_32px_80px_-20px_rgba(15,23,42,0.3)] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between bg-slate-50 px-8 py-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
                  {view === 'calendar' || view === 'month' || view === 'year' ? <CalendarIcon size={24} /> : <Clock size={24} />}
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 leading-tight">เลือก{view === 'calendar' ? 'วันที่' : view === 'time' ? 'เวลา' : view === 'month' ? 'เดือน' : 'ปี'}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Thai Standard 24H</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="h-10 w-10 rounded-full border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 hover:rotate-90 transition-all duration-300"
              >
                <X size={20} />
              </button>
            </div>

            {/* View Tabs */}
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

            <div className="p-8">
              {view === 'calendar' && (
                /* Calendar View */
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <button onClick={handlePrevMonth} className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><ChevronLeft size={24} /></button>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setView('month')}
                        className="text-lg font-black text-slate-900 hover:bg-amber-50 px-3 py-1 rounded-lg transition-colors"
                      >
                        {months[viewDate.getMonth()]}
                      </button>
                      <button 
                        onClick={() => setView('year')}
                        className="text-lg font-black text-slate-900 hover:bg-amber-50 px-3 py-1 rounded-lg transition-colors"
                      >
                        {viewDate.getFullYear() + 543}
                      </button>
                    </div>
                    <button onClick={handleNextMonth} className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"><ChevronRight size={24} /></button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {daysOfWeek.map(d => (
                      <div key={d} className="text-center text-xs font-black text-slate-300 uppercase py-2 tracking-widest">{d}</div>
                    ))}
                    {calendarDays.map((d, i) => (
                      <div key={i} className="aspect-square flex items-center justify-center">
                        {d.day && (
                          <button
                            onClick={() => handleDateClick(d.day)}
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
              )}

              {view === 'month' && (
                /* Month Selector */
                <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {months.map((m, i) => (
                    <button
                      key={m}
                      onClick={() => handleMonthSelect(i)}
                      className={`py-4 rounded-2xl text-sm font-black transition-all ${
                        viewDate.getMonth() === i ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}

              {view === 'year' && (
                /* Year Selector */
                <div className="grid grid-cols-3 gap-3 h-[280px] overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-300 px-1">
                  {Array.from({ length: 11 }).map((_, i) => {
                    const year = new Date().getFullYear() + i - 2;
                    return (
                      <button
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        className={`py-4 rounded-2xl text-sm font-black transition-all ${
                          viewDate.getFullYear() === year ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {year + 543}
                      </button>
                    );
                  })}
                </div>
              )}

              {view === 'time' && (
                /* Time View */
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
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 p-6 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={handleClear}
                className="px-6 py-4 text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
              >
                ล้างวัน
              </button>
              <button 
                onClick={handleApply}
                className="flex-1 flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 active:scale-95 transition-all"
              >
                <Check size={18} /> ยืนยันกำหนดการ
              </button>
            </div>
          </div>
        </div>
      </ModalPortal>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default CustomDateTimePicker;
