import React from 'react';
import { Check } from 'lucide-react';

const CourseBenefits = ({ learningPoints }) => {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 md:rounded-[2rem] md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 md:text-2xl">คุณจะได้เรียนรู้อะไรจากคอร์สนี้</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">สรุปประเด็นสำคัญที่ออกแบบมาให้ต่อยอดกับการทำงานจริง</p>
        </div>
        <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary md:flex">
          <Check size={24} strokeWidth={2.5} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {learningPoints.map((text, index) => (
          <div key={index} className="flex gap-4 rounded-[1.4rem] border border-slate-200 bg-white p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">
              {String(index + 1).padStart(2, '0')}
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-700">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CourseBenefits;
