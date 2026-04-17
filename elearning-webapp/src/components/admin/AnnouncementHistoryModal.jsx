import React from 'react';
import { X } from 'lucide-react';
import ModalPortal from '../common/ModalPortal';
import { formatThaiDateTime } from '../../utils/dateUtils';

const AnnouncementHistoryModal = ({
  isOpen,
  onClose,
  title,
  loading,
  historyData = []
}) => {
  return (
    <ModalPortal isOpen={isOpen}>
      <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-slate-900/60 p-4 backdrop-blur-md">
        <div className="card flex h-full w-full max-w-5xl flex-col shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 p-4">
            <div>
              <h4 className="text-lg font-bold">ประวัติการเข้าอ่าน</h4>
              <p className="text-sm text-slate-500">ประกาศ: {title}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-0">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : historyData.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-centertext-slate-500">
                <p className="text-muted">ยังไม่มีประวัติการเข้าอ่าน</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4">ผู้เข้าอ่าน</th>
                    <th className="px-6 py-4">แผนก</th>
                    <th className="px-6 py-4">วันที่เข้าอ่าน</th>
                    <th className="px-6 py-4">คะแนนสอบ</th>
                    <th className="px-6 py-4">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{item.user?.name}</span>
                          <span className="text-xs text-muted">{item.user?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.user?.department || '-'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatThaiDateTime(item.viewedAt, true)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.score !== null ? `${item.score}%` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {item.passed === true && (
                          <span className="inline-flex rounded-full bg-success/10 px-2 py-1 text-[10px] font-black uppercase text-success">
                            ผ่าน
                          </span>
                        )}
                        {item.passed === false && (
                          <span className="inline-flex rounded-full bg-danger/10 px-2 py-1 text-[10px] font-black uppercase text-danger">
                            ไม่ผ่าน
                          </span>
                        )}
                        {item.passed === null && (
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-500">
                            อ่านแล้ว
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="border-t border-gray-100 bg-gray-50 p-4 text-right">
            <button type="button" onClick={onClose} className="btn btn-outline px-8">
              ปิด
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default AnnouncementHistoryModal;
