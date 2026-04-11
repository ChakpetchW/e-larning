import React from 'react';
import { ArrowLeft, BookOpen, Clock } from 'lucide-react';
import { getFullUrl, DEFAULT_COURSE_IMAGE } from '../../utils/api';

const CourseHero = ({ 
  course, 
  totalRewardPoints, 
  completionPoints, 
  quizPoints, 
  durationHours, 
  onBack 
}) => {
  return (
    <section className="relative overflow-hidden bg-slate-950 px-4 pb-14 pt-8 text-white sm:px-5 md:px-8 md:pb-28 md:pt-14 xl:px-10 2xl:px-12">
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center bg-no-repeat opacity-60 blur-[56px]"
        style={{ backgroundImage: `url("${course.image ? getFullUrl(course.image) : DEFAULT_COURSE_IMAGE}")` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,6,23,0.92),rgba(15,23,42,0.86),rgba(15,23,42,0.48))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(67,56,202,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_26%)]" />

      <div className="relative z-10 mx-auto flex max-w-[1450px] flex-col gap-6 md:gap-8">
        <div className="flex items-center gap-4 text-sm font-bold text-slate-300">
          <button type="button" onClick={onBack} className="flex items-center gap-1 transition-colors hover:text-white">
            <ArrowLeft size={16} /> กลับ
          </button>
          <span>/</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold tracking-[0.04em] text-slate-200">
            {course.category?.name || 'หมวดทั่วไป'}
          </span>
        </div>

        <div className="grid gap-8 md:gap-10 lg:grid-cols-[minmax(0,1.5fr)_280px] lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/12 px-4 py-1.5 text-[12px] font-black tracking-[0.05em] text-primary-light">
              <BookOpen size={14} />
              หลักสูตรแนะนำ
            </div>
            <h1 className="mb-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl md:text-[2.85rem]">
              {course.title}
            </h1>
            <p className="max-w-2xl text-base font-medium leading-relaxed text-slate-200 md:text-lg">
              {course.description || 'หลักสูตรนี้ออกแบบมาเพื่อช่วยให้คุณเข้าใจเนื้อหาอย่างเป็นระบบ พร้อมนำความรู้ไปใช้ได้จริงกับงานในองค์กร'}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm font-bold text-slate-200">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-slate-400" />
                <span>{course.totalDuration || `${durationHours} ชั่วโมง`}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/95 p-4 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.45)] sm:p-5 lg:justify-self-end">
            <span className="text-[11px] font-bold tracking-[0.04em] text-slate-600">แต้มรวมทั้งคอร์ส</span>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-4xl font-black tracking-tighter text-slate-900">
                {totalRewardPoints > 0 ? totalRewardPoints.toLocaleString() : 'ฟรี'}
              </span>
              <span className="mb-1 text-sm font-bold text-slate-500">{totalRewardPoints > 0 ? 'แต้ม' : 'บทเรียน'}</span>
            </div>
            <div className="mt-3 grid gap-2 text-xs font-bold text-slate-500">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                <span>เรียนจบคอร์ส</span>
                <span>{completionPoints.toLocaleString()} แต้ม</span>
              </div>
              {quizPoints > 0 && (
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                  <span>ผ่านแบบทดสอบ</span>
                  <span>{quizPoints.toLocaleString()} แต้ม</span>
                </div>
              )}
            </div>
            <p className="mt-3 text-sm font-medium text-slate-600">
              {course.isEnrolled ? 'แต้มรวมนี้คำนวณจากแต้มเรียนจบและแต้มจากแบบทดสอบที่ผ่าน' : 'คอร์สนี้มีแต้มจากการเรียนจบและแต้มเพิ่มจากการผ่านแบบทดสอบ'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseHero;
