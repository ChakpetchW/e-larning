import React from 'react';
import { PlayCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { ENROLLMENT_STATUS } from '../../utils/constants/statuses';

const ProfileActivities = ({ courses, onNavigate }) => {
  return (
    <div className="mt-2 flex flex-col gap-1">
      <h4 className="mb-2 pl-2 text-xs font-bold tracking-[0.04em] text-gray-500">
        กิจกรรมการเรียน
      </h4>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onNavigate('/user/ongoing')}
          className="group relative flex flex-col items-start rounded-3xl border border-slate-100 bg-white p-4 md:p-5 text-left transition-all hover:shadow-xl hover:-translate-y-0.5 focus:outline-none"
        >
          <div className="mb-4 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-transform group-hover:scale-110">
            <PlayCircle size={22} className="md:w-6 md:h-6" />
          </div>
          <p className="text-[10px] md:text-[11px] font-bold tracking-[0.04em] text-slate-500">กำลังเรียนอยู่</p>
          <div className="mt-1 flex w-full items-end justify-between">
            <h5 className="text-lg md:text-xl font-black text-slate-800">
              {courses.filter((course) => course.isEnrolled && course.enrollmentStatus === ENROLLMENT_STATUS.IN_PROGRESS).length} คอร์ส
            </h5>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 opacity-0 transition-opacity group-hover:opacity-100">
              <ChevronRight size={16} className="text-slate-400" />
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('/user/completed')}
          className="group relative flex flex-col items-start rounded-3xl border border-slate-100 bg-white p-4 md:p-5 text-left transition-all hover:shadow-xl hover:-translate-y-0.5 focus:outline-none"
        >
          <div className="mb-4 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
            <CheckCircle size={22} className="md:w-6 md:h-6" />
          </div>
          <p className="text-[10px] md:text-[11px] font-bold tracking-[0.04em] text-slate-500">เรียนจบแล้ว</p>
          <div className="mt-1 flex w-full items-end justify-between">
            <h5 className="text-lg md:text-xl font-black text-slate-800">
              {courses.filter((course) => course.enrollmentStatus === ENROLLMENT_STATUS.COMPLETED).length} คอร์ส
            </h5>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 opacity-0 transition-opacity group-hover:opacity-100">
              <ChevronRight size={16} className="text-slate-400" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ProfileActivities;
