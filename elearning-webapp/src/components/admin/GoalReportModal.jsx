import React from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import ModalPortal from '../common/ModalPortal';

const GoalReportModal = ({
  reportGoal,
  reportData,
  reportLoading,
  onClose
}) => {
  if (!reportGoal) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
        <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden animate-slide-up h-[85vh] flex flex-col">
          <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="text-xl font-black text-slate-800">รายงาน: {reportGoal.title}</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                เป้าหมาย: {reportGoal.type === 'ANY' ? `เรียนจบ ${reportGoal.targetCount} คอร์ส` : `เรียนจบ ${reportGoal.courses.length} คอร์สที่ระบุ`}
              </p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {reportLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                <p className="text-sm text-slate-400 font-bold uppercase animate-pulse">กำลังประมวลผลข้อมูลรายงาน...</p>
              </div>
            ) : reportData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">พนักงานทั้งหมด</p>
                    <p className="text-3xl font-black text-slate-800">{reportData.report.length}</p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                    <p className="text-[10px] font-bold text-emerald-500 uppercase mb-1">ทำสำเร็จแล้ว</p>
                    <p className="text-3xl font-black text-emerald-600">{reportData.report.filter(r => r.isSuccess).length}</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center">
                    <p className="text-[10px] font-bold text-amber-500 uppercase mb-1">อยู่ระหว่างดำเนินการ</p>
                    <p className="text-3xl font-black text-amber-600">{reportData.report.filter(r => !r.isSuccess).length}</p>
                  </div>
                </div>

                <div className="border border-border rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-border">
                        <th className="p-4 text-left font-bold uppercase text-[10px]">พนักงาน</th>
                        <th className="p-4 text-left font-bold uppercase text-[10px]">แผนก</th>
                        <th className="p-4 text-center font-bold uppercase text-[10px]">ความคืบหน้า</th>
                        <th className="p-4 text-right font-bold uppercase text-[10px]">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.report.map(record => (
                        <tr key={record.userId} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-800">{record.name}</div>
                            <div className="text-[10px] text-slate-400">{record.email}</div>
                          </td>
                          <td className="p-4 text-slate-600 font-medium">{record.department}</td>
                          <td className="p-4">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-black text-slate-800">{record.completionCount} / {record.targetCount}</span>
                              <div className="w-24 bg-slate-100 rounded-full h-1 overflow-hidden">
                                <div 
                                  className={`h-full ${record.isSuccess ? 'bg-emerald-500' : 'bg-primary'}`} 
                                  style={{width: `${Math.min(100, (record.completionCount/record.targetCount)*100)}%`}}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            {record.isSuccess ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full text-xs">
                                <CheckCircle2 size={14} /> สำเร็จ
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-400 font-bold bg-slate-100 px-3 py-1 rounded-full text-xs">
                                <XCircle size={14} /> ยังไม่ผ่าน
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center p-12 text-slate-400 font-bold">ไม่สามารถโหลดข้อมูลรายงานได้</div>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default GoalReportModal;
