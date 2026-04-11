import React from 'react';
import { RotateCcw, Edit, Trash2 } from 'lucide-react';
import { formatThaiDateTime } from '../../utils/dateUtils';

const CourseTable = ({ courses, loading, onEdit, onDelete, onRepublish }) => {
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="col-span-full rounded-2xl border-2 border-dashed border-border bg-gray-50/50 p-12 text-center text-muted">
        ไม่พบคอร์สเรียนที่ตรงกับเงื่อนไข
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border bg-gray-50 text-sm text-muted">
            <th className="p-4 font-medium">ชื่อคอร์ส</th>
            <th className="p-4 font-medium">หมวดหมู่</th>
            <th className="p-4 font-medium">สิทธิ์การเห็น</th>
            <th className="p-4 font-medium text-right">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id} className="border-b border-border transition-colors hover:bg-gray-50/50">
              <td className="p-4">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-left">{course.title}</span>
                  {course.isTemporary && (
                    <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      course.isArchived
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {course.isArchived ? 'Archived' : 'Limited Time'} · {formatThaiDateTime(course.expiredAt, true)}
                    </span>
                  )}
                </div>
              </td>
              <td className="p-4 text-sm text-muted">
                <div className="flex flex-col gap-1 text-left">
                  <span>{course.category?.name || 'Uncategorized'}</span>
                  {course.category?.isTemporary && (
                    <span className="text-[11px] font-bold text-amber-700">
                      หมวดชั่วคราว · {formatThaiDateTime(course.category?.expiredAt, true)}
                    </span>
                  )}
                </div>
              </td>
              <td className="p-4 text-sm text-muted text-left">
                {course.visibleToAll ? (
                  <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                    ทุกคน
                  </span>
                ) : (
                  <div className="space-y-1">
                    <div>แผนก {course.visibleDepartments?.length || 0} รายการ</div>
                    <div>ระดับผู้ใช้งาน {course.visibleTiers?.length || 0} รายการ</div>
                  </div>
                )}
              </td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                  {course.isArchived && (
                    <button
                      type="button"
                      onClick={() => onRepublish(course.id)}
                      className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50"
                      title="Republish"
                    >
                      <RotateCcw size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onEdit(course)}
                    className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(course.id)}
                    className="rounded p-1.5 text-danger hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseTable;
