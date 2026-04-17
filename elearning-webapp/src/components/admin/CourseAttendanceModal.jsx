import React, { useState, useEffect } from 'react';
import { Search, X, Users, Filter, CalendarDays } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import { formatThaiDateTime } from '../../utils/dateUtils';
import ModalPortal from '../common/ModalPortal';
import CustomSelect from '../common/CustomSelect';
import { ENROLLMENT_STATUS } from '../../utils/constants/statuses';

const getStatusBadge = (status) => {
  switch (status) {
    case 'COMPLETED':
      return <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">เรียนจบแล้ว</span>;
    case 'IN_PROGRESS':
      return <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">กำลังเรียน</span>;
    default:
      return <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">ยังไม่เริ่ม</span>;
  }
};

const CourseAttendanceModal = ({ isOpen, onClose, course, departments, tiers }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    departmentId: '',
    tierId: '',
    month: '',
    year: new Date().getFullYear().toString(),
  });

  const months = [
    { value: '', label: 'ทุกเดือน' },
    { value: '01', label: 'มกราคม' },
    { value: '02', label: 'กุมภาพันธ์' },
    { value: '03', label: 'มีนาคม' },
    { value: '04', label: 'เมษายน' },
    { value: '05', label: 'พฤษภาคม' },
    { value: '06', label: 'มิถุนายน' },
    { value: '07', label: 'กรกฎาคม' },
    { value: '08', label: 'สิงหาคม' },
    { value: '09', label: 'กันยายน' },
    { value: '10', label: 'ตุลาคม' },
    { value: '11', label: 'พฤศจิกายน' },
    { value: '12', label: 'ธันวาคม' },
  ];

  const currentYear = new Date().getFullYear();
  const years = [
    { value: '', label: 'ทุกปี' },
    { value: currentYear.toString(), label: String(currentYear + 543) },
    { value: (currentYear - 1).toString(), label: String(currentYear + 542) },
    { value: (currentYear - 2).toString(), label: String(currentYear + 541) },
  ];

  useEffect(() => {
    if (isOpen && course) {
      fetchHistory();
    }
  }, [isOpen, course, filters.departmentId, filters.tierId, filters.month, filters.year]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.departmentId) params.departmentId = filters.departmentId;
      if (filters.tierId) params.tierId = filters.tierId;
      if (filters.month) params.month = filters.month;
      if (filters.month && filters.year) params.year = filters.year;

      const response = await adminAPI.getCourseHistory(course.id, params);
      setHistory(response.data || []);
    } catch (error) {
      console.error('Failed to fetch course history', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      departmentId: '',
      tierId: '',
      month: '',
      year: new Date().getFullYear().toString(),
    });
  };

  if (!isOpen) return null;

  return (
    <ModalPortal isOpen={isOpen}>
      <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-slate-900/60 p-4 backdrop-blur-md">
        <div className="card flex h-full w-full max-w-6xl flex-col border border-slate-100 bg-white p-0 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Users size={20} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-800">ประวัติการเข้าเรียน</h4>
                <p className="text-sm text-slate-500">{course?.title}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="border-b border-slate-100 bg-white p-5">
            <div className="flex flex-wrap items-end gap-4">
              <CustomSelect
                label="แผนก"
                className="flex-1 min-w-[200px]"
                value={filters.departmentId}
                onChange={(e) => setFilters({ ...filters, departmentId: e.target.value })}
                options={[
                  { value: '', label: 'ทั้งหมด' },
                  ...departments.map((d) => ({ value: d.id, label: d.name }))
                ]}
              />

              <CustomSelect
                label="ระดับผู้ใช้งาน"
                className="w-full sm:w-48"
                value={filters.tierId}
                onChange={(e) => setFilters({ ...filters, tierId: e.target.value })}
                options={[
                  { value: '', label: 'ทั้งหมด' },
                  ...tiers.map((t) => ({ value: t.id, label: t.name }))
                ]}
              />

              <CustomSelect
                label="เดือน"
                className="w-full sm:w-44"
                value={filters.month}
                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                options={months}
              />

              <CustomSelect
                label="ปี"
                className="w-full sm:w-36"
                value={filters.year}
                disabled={!filters.month}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                options={years}
              />

              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-slate-50/50">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-slate-400 flex-col gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <Search size={32} />
                </div>
                <p className="font-medium">ไม่พบประวัติผู้เข้าเรียนตามเงื่อนไขที่เลือก</p>
              </div>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead className="sticky top-0 bg-white/95 backdrop-blur shadow-sm">
                  <tr className="border-b border-slate-200 text-sm text-slate-500">
                    <th className="p-4 font-bold">ชื่อผู้เรียน</th>
                    <th className="p-4 font-bold">แผนก / ระดับ</th>
                    <th className="p-4 font-bold">วันที่เริ่มเรียน</th>
                    <th className="p-4 font-bold">สถานะ</th>
                    <th className="p-4 font-bold">คะแนนแบบทดสอบ</th>
                    <th className="p-4 font-bold">วันที่เรียนจบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {history.map((record) => (
                    <tr key={record.id} className="transition-colors hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="font-bold text-slate-700">{record.user.name}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 text-sm text-slate-600">
                          <span className="font-medium">{record.user.department}</span>
                          <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full w-fit">
                            {record.user.tier}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-600">
                        {formatThaiDateTime(record.startedAt, true)}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          {getStatusBadge(record.status)}
                          <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${record.progressPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                              style={{ width: `${record.progressPercent || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {record.quizScore !== null ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-700 text-lg">{record.quizScore}</span>
                            {record.quizPassed ? (
                              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">ผ่าน</span>
                            ) : (
                              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">ไม่ผ่าน</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-sm font-medium text-slate-500">
                        {record.completedAt ? formatThaiDateTime(record.completedAt, true) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default CourseAttendanceModal;
