import React from 'react';
import { FileText, Check, Clock } from 'lucide-react';

const CourseDocumentList = ({ course, documentLessons, onNavigate }) => {
  if (documentLessons.length === 0) return null;

  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:rounded-[2rem] md:p-8">
      <div className="mb-4 flex items-center justify-between gap-4 md:mb-5">
        <h2 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl">เอกสารประกอบทั้งหมด</h2>
        <span className="shrink-0 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-2 text-sm font-bold text-slate-600 whitespace-nowrap">
          <FileText size={16} />
          {documentLessons.length} เอกสาร
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {documentLessons.map((lesson) => (
          <button
            key={lesson.id}
            type="button"
            onClick={() => course.isEnrolled && onNavigate(`/user/courses/${course.id}/lesson/${lesson.id}`)}
            disabled={!course.isEnrolled}
            aria-label={course.isEnrolled ? `เปิดเอกสาร ${lesson.title}` : `เอกสาร ${lesson.title} ต้องลงทะเบียนก่อน`}
            className={`group relative flex w-full flex-row items-center gap-3 overflow-hidden rounded-[1.35rem] border p-4 text-left transition-all duration-300 sm:gap-4 sm:p-5 ${
              course.isEnrolled
                ? 'bg-white hover:-translate-y-0.5 hover:border-primary/30'
                : 'cursor-default border-slate-100 bg-slate-50 opacity-80'
            }`}
            style={course.isEnrolled ? { borderColor: 'rgba(226, 232, 240, 0.6)', boxShadow: 'var(--shadow-premium)' } : {}}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(79,70,229,0.24),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="flex items-center gap-3 min-w-0 flex-1 sm:gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] transition-all duration-300 sm:h-12 sm:w-12 ${
                  lesson.isCompleted
                    ? 'bg-emerald-100 text-emerald-600 ring-1 ring-emerald-500/15'
                    : course.isEnrolled
                      ? 'bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary'
                      : 'bg-slate-100 text-slate-300'
                }`}
              >
                {lesson.isCompleted ? <Check size={20} strokeWidth={2.8} /> : <FileText size={20} strokeWidth={2.2} />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <h3 className="flex-1 text-[15px] font-extrabold leading-tight text-slate-800 transition-colors duration-300 group-hover:text-primary line-clamp-1">
                    {lesson.title}
                  </h3>
                </div>

                <div className="mt-1 flex items-center gap-3 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className={course.isEnrolled ? 'group-hover:text-primary/70' : ''} />
                    {lesson.duration || '10'} นาที
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`inline-flex shrink-0 items-center justify-center rounded-full px-3 py-1.5 text-[12px] font-black tracking-[0.04em] transition-all duration-300 ${
                course.isEnrolled ? 'bg-slate-900 text-white group-hover:bg-primary' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {course.isEnrolled ? 'เปิดอ่าน' : 'Locked'}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default CourseDocumentList;
