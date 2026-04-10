import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, X, Check, Timer } from 'lucide-react';
import { formatThaiDateTime } from '../../utils/dateUtils';
import ModalPortal from '../common/ModalPortal';

const CustomDateTimePicker = ({ value, onChange, label = 'กำหนดวันและเวลาหมดอายุ (พ.ศ.)' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('calendar'); // 'calendar' or 'time'
  
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

  const handleDateClick = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setSelectedDate(newDate);
    setView('time'); // Switch to time selection after picking date
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
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    
    const isoString = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    onChange({ target: { value: isoString } });
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
            {value ? formatThaiDateTime(value, true) : 'คลิกเพื่อกำหนดวันและเวลา...'}
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
          
          <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-white shadow-[0_32px_80px_-20px_rgba(15,23,42,0.3)] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between bg-slate-50 px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  {view === 'calendar' ? <CalendarIcon size={16} /> : <Clock size={16} />}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 leading-tight">เลือก{view === 'calendar' ? 'วันที่' : 'เวลา'}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thai Standard 24H</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* View Tabs */}
            <div className="flex p-2 gap-1 bg-slate-50/50 border-b border-slate-100">
              <button 
                onClick={() => setView('calendar')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black transition-all ${
                  view === 'calendar' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <CalendarIcon size={14} /> วันที่
              </button>
              <button 
                onClick={() => setView('time')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black transition-all ${
                  view === 'time' ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Clock size={14} /> เวลา
              </button>
            </div>

            <div className="p-6">
              {view === 'calendar' ? (
                /* Calendar View */
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronLeft size={18} /></button>
                    <div className="text-sm font-black text-slate-900">
                      {months[viewDate.getMonth()]} {viewDate.getFullYear() + 543}
                    </div>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronRight size={18} /></button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {daysOfWeek.map(d => (
                      <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase py-1">{d}</div>
                    ))}
                    {calendarDays.map((d, i) => (
                      <div key={i} className="aspect-square flex items-center justify-center">
                        {d.day && (
                          <button
                            onClick={() => handleDateClick(d.day)}
                            className={`h-9 w-9 text-xs font-bold rounded-xl transition-all ${
                              isSelected(d.day) 
                                ? 'bg-slate-900 text-white shadow-lg' 
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
              ) : (
                /* Time View */
                <div className="flex flex-col items-center gap-6 py-4">
                  <div className="flex items-center gap-4">
                    {/* Hours */}
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ชั่วโมง</span>
                      <div className="flex flex-col h-40 w-16 overflow-y-auto no-scrollbar snap-y snap-mandatory border border-slate-100 rounded-2xl bg-slate-50">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setHours(i)}
                            className={`h-12 shrink-0 flex items-center justify-center text-sm font-black snap-center transition-all ${
                              hours === i ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {i.toString().padStart(2, '0')}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-2xl font-black text-slate-300 self-end mb-2">:</div>
                    
                    {/* Minutes */}
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">นาที</span>
                      <div className="flex flex-col h-40 w-16 overflow-y-auto no-scrollbar snap-y snap-mandatory border border-slate-100 rounded-2xl bg-slate-50">
                        {Array.from({ length: 60 }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setMinutes(i)}
                            className={`h-12 shrink-0 flex items-center justify-center text-sm font-black snap-center transition-all ${
                              minutes === i ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {i.toString().padStart(2, '0')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
                    <Timer size={14} className="text-amber-500" />
                    <span className="text-sm font-black text-amber-900">
                      {hours.toString().padStart(2, '0')} : {minutes.toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 p-4 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={handleClear}
                className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              >
                ล้างวัน
              </button>
              <button 
                onClick={handleApply}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
              >
                <Check size={14} /> ยืนยันกำหนดการ
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
