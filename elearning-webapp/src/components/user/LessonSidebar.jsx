import React from 'react';
import { CheckCircle, FileText, ChevronRight } from 'lucide-react';

const LessonSidebar = ({
  completed,
  showAchievementCard,
  nextLessonId,
  handleNavigateToNextLesson,
  handleReturnToCourse,
  resources
}) => {
  return (
    <div className="lg:col-span-4 flex flex-col gap-8">
      {/* Achievement Card */}
      {showAchievementCard && completed && (
        <div className="relative overflow-hidden rounded-[3rem] border border-slate-100 bg-white p-10 text-center shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] animate-celebrate">
          <div className="absolute top-[-10%] right-[-10%] w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06),transparent_70%)]"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-200 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <CheckCircle size={40} strokeWidth={2.4} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">คุณทำได้แล้ว!</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 px-4">ความพยายามของคุณเห็นผลแล้ว พร้อมก้าวต่อไปหรือยัง?</p>
            
            {nextLessonId ? (
              <button
                onClick={handleNavigateToNextLesson}
                className="w-full rounded-2xl bg-slate-900 py-5 text-base font-black tracking-[0.04em] text-white shadow-2xl shadow-slate-200 transition-all hover:bg-primary active:scale-95"
              >
                ไปบทถัดไป →
              </button>
            ) : (
              <button
                onClick={handleReturnToCourse}
                className="w-full rounded-2xl bg-slate-100 py-5 text-base font-black tracking-[0.04em] text-slate-900 transition-all hover:bg-slate-200 active:scale-95"
              >
                กลับสู่คอร์สเรียน
              </button>
            )}
          </div>
        </div>
      )}

      {/* Resources Column */}
      {resources && resources.length > 0 && (
        <div className="sticky top-8 rounded-[2.5rem] border border-slate-100 bg-slate-50/50 p-8">
          <h4 className="mb-6 flex items-center gap-2.5 text-[11px] font-black tracking-[0.04em] text-slate-500 uppercase">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div> เอกสารเสริม
          </h4>
          <div className="flex flex-col gap-4">
            {resources.map((res, i) => (
              <a
                key={i}
                href={res.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-primary hover:shadow-2xl hover:-translate-y-1 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-50 text-red-500 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                    <FileText size={18} strokeWidth={2.5}/>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-800 line-clamp-1">{res.title}</p>
                    <p className="text-[11px] font-bold tracking-[0.04em] text-slate-500 uppercase">{res.size || 'Download'}</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonSidebar;
