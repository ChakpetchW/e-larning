import React from 'react';
import { PlayCircle, Star, Clock } from 'lucide-react';
import { getFullUrl, DEFAULT_COURSE_IMAGE } from '../../utils/api';

const CourseCard = ({ course, onClick, className = '', variant = 'default' }) => {
  const isCompleted = variant === 'completed' || course.enrollmentStatus === 'COMPLETED';
  const completedDate = course.completedAt
    ? new Date(course.completedAt).toLocaleDateString('th-TH')
    : 'ไม่ระบุวันที่';
  const pointsSuffix = course.points > 0 ? 'แต้ม' : 'เรียน';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`เปิดคอร์ส ${course.title}`}
      className={`group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${className}`}
    >
      <div className="relative w-full aspect-[16/9] overflow-hidden border-b border-gray-100 bg-gray-100">
        <img
          src={course.image ? getFullUrl(course.image) : DEFAULT_COURSE_IMAGE}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/20 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-14 w-14 scale-75 items-center justify-center rounded-full bg-white/95 shadow-lg transition-all duration-300 group-hover:scale-100">
            <PlayCircle size={28} className="text-primary" />
          </div>
        </div>
        {course.isEnrolled && (
          <div className="absolute right-2 top-2 z-20">
            <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/10 text-primary'}`}>
              {isCompleted ? 'เรียนจบแล้ว' : 'กำลังเรียน'}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            {course.category?.name || 'หมวดทั่วไป'}
          </span>
        </div>
        <h3 className="mb-2 min-h-[44px] line-clamp-2 text-[1.05rem] font-bold leading-snug text-slate-900 transition-colors group-hover:text-primary">
          {course.title}
        </h3>

        <div className="mb-4 mt-auto flex items-center gap-3">
          {variant === 'completed' ? (
            <div className="flex items-center gap-2 rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
              <Clock size={12} /> {completedDate}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-slate-800">{course.rating || '4.8'}</span>
              <span className="text-xs font-medium text-gray-400">({course.reviewCount || '124'})</span>
            </div>
          )}

          {variant !== 'completed' && (
            <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3 text-[13px] font-medium text-gray-500">
              <Clock size={14} className="text-gray-400" />
              <span>{course.lessons?.reduce((acc, lesson) => acc + (parseInt(lesson.duration, 10) || 0), 0) || course.totalDuration || '2 ชม.'}</span>
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-gray-100 pt-3.5">
          <div className={`flex items-center gap-1.5 overflow-hidden ${variant === 'completed' ? 'order-2' : ''}`}>
            <div className="h-5 w-5 flex-shrink-0 rounded-full bg-slate-200" />
            <span className="truncate text-[11px] font-medium text-gray-500">
              ผู้สอน: {course.instructorName || 'ทีมงานวิทยากร'}
            </span>
          </div>
          <div className={`flex shrink-0 flex-col items-end leading-tight ${variant === 'completed' ? 'order-1' : ''}`}>
            <span className={`text-[1.1rem] font-black tracking-tighter ${variant === 'completed' ? 'text-amber-600' : 'text-primary'}`}>
              {course.points > 0 ? course.points.toLocaleString() : 'ฟรี'}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 -mt-0.5">
              {pointsSuffix}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default React.memo(CourseCard);
