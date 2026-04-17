import React, { useState } from 'react';
import { RotateCcw, Edit, Trash2, History, Archive } from 'lucide-react';
import { formatThaiDateTime } from '../../utils/dateUtils';
import AdminActionMenu from './AdminActionMenu';

const CourseTable = ({ courses, loading, onEdit, onDelete, onRepublish, onViewHistory, onArchive }) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);
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
            <th className="p-4 font-medium text-center">จัดการ</th>
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
              <td className="p-4 text-center">
                <div className="flex justify-center">
                  <AdminActionMenu
                    isOpen={openDropdownId === course.id}
                    onToggle={() => setOpenDropdownId(openDropdownId === course.id ? null : course.id)}
                    actions={[
                      {
                        icon: History,
                        label: 'ประวัติการเข้าเรียน',
                        onClick: () => onViewHistory(course),
                        className: 'text-slate-600 hover:bg-blue-50 hover:text-blue-600',
                        iconClassName: 'bg-blue-50 text-blue-500 group-hover:bg-blue-100',
                      },
                      {
                        icon: Edit,
                        label: 'แก้ไขคอร์สเรียน',
                        onClick: () => onEdit(course),
                        className: 'text-slate-600 hover:bg-slate-50 hover:text-primary',
                        iconClassName: 'bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary',
                      },
                      {
                        hidden: course.isArchived,
                        icon: Archive,
                        label: 'เก็บเข้าคลัง',
                        onClick: () => onArchive(course.id),
                        className: 'text-slate-600 hover:bg-amber-50 hover:text-amber-600',
                        iconClassName: 'bg-amber-50 text-amber-500 group-hover:bg-amber-100',
                      },
                      {
                        hidden: !course.isArchived,
                        icon: RotateCcw,
                        label: 'นำกลับมาใช้งาน',
                        onClick: () => onRepublish(course.id),
                        className: 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-600',
                        iconClassName: 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100',
                      },
                      {
                        icon: Trash2,
                        label: 'ลบคอร์สเรียน',
                        onClick: () => onDelete(course.id),
                        className: 'text-slate-500 hover:bg-red-50 hover:text-red-600 mt-1 border-t border-slate-100/60 pt-2',
                        iconClassName: 'bg-red-50 text-red-500 group-hover:bg-red-100',
                      }
                    ]}
                  />
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
