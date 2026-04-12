import React from 'react';
import { Calendar, FileText, Trash2 } from 'lucide-react';
import { formatThaiDateTime } from '../../utils/dateUtils';
import AdminTable from './AdminTable';

const GoalList = ({ goals, columns, onViewReport, onDeleteGoal }) => {
  return (
    <div className="card">
      <AdminTable 
        columns={columns}
        data={goals}
        emptyMessage="ยังไม่มีการกำหนดเป้าหมายในขณะนี้"
        renderRow={(goal) => (
          <tr key={goal.id} className="border-b border-border hover:bg-gray-50/50 transition-colors">
            <td className="p-4">
              <div className="font-bold text-slate-800">{goal.title}</div>
              <div className="text-xs text-muted">สร้างเมื่อ {formatThaiDateTime(goal.createdAt)}</div>
            </td>
            <td className="p-4">
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${goal.type === 'ANY' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                {goal.type === 'ANY' ? 'คอร์สใดก็ได้' : 'เฉพาะคอร์ส'}
              </span>
            </td>
            <td className="p-4 text-sm text-slate-600">
              {goal.type === 'ANY' ? (
                <span>เรียนจบ {goal.targetCount} คอร์ส</span>
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{goal.courses.length} คอร์สที่กำหนด</span>
                  <div className="flex flex-wrap gap-1">
                    {goal.courses.slice(0, 2).map(gc => (
                      <span key={gc.courseId} className="text-[10px] bg-slate-100 px-1 rounded">{gc.course.title}</span>
                    ))}
                    {goal.courses.length > 2 && <span className="text-[10px] text-muted">...และอีก {goal.courses.length - 2} คอร์ส</span>}
                  </div>
                </div>
              )}
            </td>
            <td className="p-4 text-sm font-medium">
              {goal.expiryDate ? (
                <div className="flex items-center gap-1 text-slate-700">
                  <Calendar size={14} className="text-muted" />
                  {formatThaiDateTime(goal.expiryDate)}
                </div>
              ) : <span className="text-muted">ไม่มีกำหนด</span>}
            </td>
            <td className="p-4">
              <span className={`text-xs font-medium ${goal.scope === 'GLOBAL' ? 'text-blue-600' : 'text-amber-600'}`}>
                {goal.scope === 'GLOBAL' ? 'ทั้งองค์กร' : `แผนก ${goal.department?.name || 'ของคุณ'}`}
              </span>
            </td>
            <td className="p-4 text-right">
              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => onViewReport(goal)} 
                  className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors" 
                  title="ดูรายงาน"
                >
                  <FileText size={18} />
                </button>
                <button 
                  type="button"
                  onClick={() => onDeleteGoal(goal.id)} 
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                  title="ลบเป้าหมาย"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </td>
          </tr>
        )}
      />
    </div>
  );
};

export default GoalList;
