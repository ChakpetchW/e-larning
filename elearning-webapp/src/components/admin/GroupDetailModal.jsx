import React from 'react';
import { TrendingUp, X, BookOpen } from 'lucide-react';
import ModalPortal from '../common/ModalPortal';

const TYPE_COLORS = {
  'LEADERSHIP': '#6366f1',
  'FUNCTION': '#94a3b8',
  'INNOVATION': '#f59e0b'
};

const GroupDetailModal = ({ selectedGroup, onClose }) => {
  if (!selectedGroup) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in focus:outline-none outline-none">
        <button
          type="button"
          className="absolute inset-0 bg-slate-950/65"
          onClick={onClose}
          aria-label="ปิดรายละเอียดกลุ่มคอร์ส"
        />
        <div className="relative flex w-full max-w-4xl max-h-[88vh] flex-col overflow-hidden rounded-[2.5rem] bg-white/95 animate-slide-up shadow-[0_32px_100px_-32px_rgba(15,23,42,0.55)] focus:outline-none outline-none">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div 
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg" 
                style={{ backgroundColor: TYPE_COLORS[selectedGroup.name.toUpperCase()] || '#4f46e5' }}
              >
                <TrendingUp size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-slate-900">รายละเอียดกลุ่ม {selectedGroup.name}</h3>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">ข้อมูลสถิติแยกตามรายคอร์ส</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-100/90 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 border-b border-slate-100 bg-slate-50/60 p-6">
            <div className="flex flex-col gap-1 rounded-[1.75rem] bg-white p-4 text-center shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">คอร์สทั้งหมด</p>
              <p className="text-2xl font-black text-slate-800 leading-none">{selectedGroup.value}</p>
            </div>
            <div className="flex flex-col gap-1 rounded-[1.75rem] bg-white p-4 text-center shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">จำนวนผู้เรียนรวม</p>
              <p className="text-2xl font-black text-primary leading-none">{selectedGroup.enrollmentCount.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 no-scrollbar h-full">
            <h4 className="mb-4 text-xs font-black text-slate-400 uppercase tracking-widest text-left">รายชื่อคอร์สในกลุ่มนี้</h4>
            <div className="space-y-3">
              {selectedGroup.courses && [...selectedGroup.courses].sort((a,b) => b.students - a.students).map((course, idx) => (
                <div key={course.id} className="flex items-center justify-between rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-all group hover:shadow-md hover:ring-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 text-xs font-black group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                      #{idx + 1}
                    </div>
                    <span className="text-sm font-bold text-slate-800 line-clamp-1 text-left">{course.title}</span>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs font-black text-slate-900">{course.students.toLocaleString()} คน</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ลงทะเบียนแล้ว</span>
                  </div>
                </div>
              ))}
              {(!selectedGroup.courses || selectedGroup.courses.length === 0) && (
                <div className="py-20 text-center">
                  <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-sm font-bold text-slate-400">ยังไม่มีคอร์สในกลุ่มนี้</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default GroupDetailModal;
