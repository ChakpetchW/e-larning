import React from 'react';
import { Clock, PlayCircle } from 'lucide-react';
import { DEFAULT_COURSE_IMAGE, getFullUrl } from '../../utils/api';

const CourseCard = ({ course, onClick, className = '', variant = 'default' }) => {
  const isCompleted = variant === 'completed' || course.enrollmentStatus === 'COMPLETED';
  const pointsSuffix = course.points > 0 ? 'แต้ม' : 'เรียน';

  const lessonDuration = course.lessons?.reduce(
    (total, lesson) => total + (parseInt(lesson.duration, 10) || 0),
    0
  );

  const durationLabel = lessonDuration || course.totalDuration || 'พรีเมียม';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`เปิดคอร์ส ${course.title}`}
      className={`group flex h-full self-stretch flex-col overflow-hidden rounded-xl border bg-white text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${className}`}
      style={{
        borderColor: 'rgba(226, 232, 240, 0.5)',
        boxShadow: 'var(--shadow-premium)',
      }}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-gray-100 bg-gray-100">
        <img
          src={course.image ? getFullUrl(course.image) : DEFAULT_COURSE_IMAGE}
          alt={course.title}
          loading="lazy"
          width={400}
          height={225}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/20 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-14 w-14 scale-75 items-center justify-center rounded-full bg-white/95 shadow-lg transition-all duration-300 group-hover:scale-100">
            <PlayCircle size={28} className="text-primary" />
          </div>
        </div>

        {course.isEnrolled && (
          <div className="absolute right-2 top-2 z-20">
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-primary/5 text-primary'
              }`}
            >
              {isCompleted ? 'เรียนจบแล้ว' : 'กำลังเรียน'}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            {course.category?.name || 'หมวดทั่วไป'}
          </span>
        </div>

        <h3 className="mb-3 min-h-[2.7rem] line-clamp-2 text-[1rem] font-bold leading-[1.3] text-slate-800 transition-colors group-hover:text-primary">
          {course.title}
        </h3>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-slate-100/50 pt-4">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <Clock size={12} strokeWidth={2.5} />
            <span>{durationLabel}</span>
          </div>

          <div className="flex flex-col items-end leading-none">
            <span className="text-[1.125rem] font-bold tracking-tight text-primary">
              {course.points > 0 ? course.points.toLocaleString() : 'FREE'}
            </span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
              {pointsSuffix}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default React.memo(CourseCard);
