import React from 'react';
import { ArrowRight, Target } from 'lucide-react';

const MobileContinueCTA = ({ continueCourse, onNavigate }) => {
  return (
    <div className="md:hidden -mt-6 -mx-5 px-5">
      {continueCourse ? (
        <button
          onClick={() => onNavigate(`/user/courses/${continueCourse.id}`)}
          className="w-full rounded-[1.9rem] border border-slate-900 bg-slate-900 p-6 text-white flex flex-col gap-4 shadow-xl active:scale-[0.98] transition-all"
        >
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold tracking-[0.04em] text-slate-400">คอร์สปัจจุบัน</span>
            <span className="text-xs font-bold text-primary">{continueCourse.progressPercent}%</span>
          </div>
          <h3 className="text-lg font-bold text-left line-clamp-1">{continueCourse.title}</h3>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: `${continueCourse.progressPercent}%` }}></div>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] font-bold tracking-[0.04em] text-primary">
            เรียนต่อจากบทล่าสุด <ArrowRight size={14} />
          </div>
        </button>
      ) : (
        <button
          onClick={() => onNavigate('/user/courses')}
          className="w-full rounded-[1.9rem] bg-primary text-white p-6 flex items-center justify-between shadow-xl shadow-primary/20"
        >
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">Get Started</p>
            <h3 className="text-lg font-bold">เริ่มบทเรียนใหม่วันนี้</h3>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Target size={24} />
          </div>
        </button>
      )}
    </div>
  );
};

export default MobileContinueCTA;
