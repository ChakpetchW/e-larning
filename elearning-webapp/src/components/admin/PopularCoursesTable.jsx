import React from 'react';

const PopularCoursesTable = ({ courses }) => {
  return (
    <div className="card p-6 lg:col-span-2 overflow-hidden">
      <h3 className="text-lg font-bold mb-6">คอร์สยอดนิยม</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-black text-muted uppercase tracking-widest border-b border-border">
              <th className="pb-4 font-black">ชื่อคอร์สเรียน</th>
              <th className="pb-4 font-black text-right pr-6">การลงทะเบียน</th>
            </tr>
          </thead>
          <tbody>
            {(courses || []).map((course, i) => (
              <tr key={course.id} className="border-b border-gray-50 last:border-0 group">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs text-left">#{i + 1}</div>
                    <span className="font-bold text-sm group-hover:text-primary transition-colors text-left">{course.title}</span>
                  </div>
                </td>
                <td className="py-4 text-right pr-6">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-success">{course.students} คน</span>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full"
                        style={{ width: `${Math.max(8, Math.min(100, course.students * 10))}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PopularCoursesTable;
