import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coins,
  Gift,
  TrendingDown,
  TrendingUp,
  User2,
  X,
} from 'lucide-react';

const formatDate = (value, options = {}) => {
  if (!value) {
    return '-';
  }

  const formatter = options.hour || options.minute
    ? 'toLocaleString'
    : 'toLocaleDateString';

  return new Date(value)[formatter]('th-TH', options);
};

const UserDetailModal = ({ isOpen, loading, detail, onClose }) => {
  const [activeTab, setActiveTab] = useState('learning');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('learning');
    }
  }, [isOpen, detail?.id]);

  if (!isOpen) {
    return null;
  }

  const enrollments = detail?.enrollments || [];
  const pointsHistory = detail?.pointsHistory || [];

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="card flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden border border-slate-100 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h3 className="text-xl font-black text-slate-900">ประวัติผู้ใช้งานรายบุคคล</h3>
            <p className="mt-1 text-sm text-slate-500">ดูทั้งประวัติการเรียนและประวัติการได้ใช้แต้มในหน้าต่างเดียว</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="ปิดหน้าต่างประวัติผู้ใช้งาน"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="py-20 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            </div>
          ) : !detail ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
              ไม่พบข้อมูลผู้ใช้งาน
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
                  <div className="mb-3 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                    <User2 size={18} />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">พนักงาน</div>
                  <div className="mt-2 text-lg font-black text-slate-900">{detail.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{detail.email}</div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
                  <div className="mb-3 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-600">
                    <CalendarDays size={18} />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">เริ่มงาน</div>
                  <div className="mt-2 text-lg font-black text-slate-900">
                    {formatDate(detail.employmentDate)}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">วันที่เริ่มเป็นพนักงานในระบบ</div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
                  <div className="mb-3 inline-flex rounded-2xl bg-amber-100 p-3 text-amber-600">
                    <Clock3 size={18} />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">แผนก / ระดับ</div>
                  <div className="mt-2 text-lg font-black text-slate-900">{detail.department || '-'}</div>
                  <div className="mt-1 text-sm text-slate-500">{detail.tier || 'ยังไม่ได้กำหนดระดับ'}</div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
                  <div className="mb-3 inline-flex rounded-2xl bg-sky-100 p-3 text-sky-600">
                    <Coins size={18} />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Point Balance</div>
                  <div className="mt-2 text-lg font-black text-slate-900">
                    {detail.pointsBalance?.toLocaleString?.() || 0}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">แต้มคงเหลือล่าสุดของผู้ใช้</div>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-base font-black text-slate-900">ข้อมูลย้อนหลัง</h4>
                      <p className="mt-1 text-sm text-slate-500">สลับดูประวัติการเรียนหรือประวัติ Point ได้ตามต้องการ</p>
                    </div>
                    <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
                      <button
                        type="button"
                        onClick={() => setActiveTab('learning')}
                        className={`rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${activeTab === 'learning' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
                      >
                        ประวัติการเรียน
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('points')}
                        className={`rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${activeTab === 'points' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
                      >
                        ประวัติ Point
                      </button>
                    </div>
                  </div>
                </div>

                {activeTab === 'learning' ? (
                  enrollments.length === 0 ? (
                    <div className="px-5 py-12 text-center text-sm text-slate-500">ยังไม่มีประวัติการลงเรียน</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] border-collapse text-left">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50 text-sm text-slate-500">
                            <th className="px-5 py-3 font-semibold">คอร์ส</th>
                            <th className="px-5 py-3 font-semibold">หมวดหมู่</th>
                            <th className="px-5 py-3 font-semibold">เริ่มเรียน</th>
                            <th className="px-5 py-3 font-semibold">เรียนจบ</th>
                            <th className="px-5 py-3 font-semibold">ความคืบหน้า</th>
                            <th className="px-5 py-3 font-semibold">สถานะ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {enrollments.map((enrollment) => (
                            <tr key={enrollment.id} className="border-b border-slate-100 last:border-b-0">
                              <td className="px-5 py-4">
                                <div className="font-bold text-slate-900">{enrollment.course.title}</div>
                                <div className="mt-1 text-xs text-slate-400">
                                  แต้มคอร์ส {enrollment.course.points || 0}
                                </div>
                              </td>
                              <td className="px-5 py-4 text-sm text-slate-600">
                                {enrollment.course.categoryName || '-'}
                              </td>
                              <td className="px-5 py-4 text-sm text-slate-600">
                                {formatDate(enrollment.startedAt, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                              <td className="px-5 py-4 text-sm text-slate-600">
                                {formatDate(enrollment.completedAt, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                              <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                                {Math.round(enrollment.progressPercent || 0)}%
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                    enrollment.status === 'COMPLETED'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {enrollment.status === 'COMPLETED' ? 'เรียนจบแล้ว' : 'กำลังเรียน'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : pointsHistory.length === 0 ? (
                  <div className="px-5 py-12 text-center text-sm text-slate-500">ยังไม่มีประวัติ Point</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-sm text-slate-500">
                          <th className="px-5 py-3 font-semibold">ประเภท</th>
                          <th className="px-5 py-3 font-semibold">ที่มา / การใช้งาน</th>
                          <th className="px-5 py-3 font-semibold">หมายเหตุ</th>
                          <th className="px-5 py-3 font-semibold text-right">Point</th>
                          <th className="px-5 py-3 font-semibold">เวลา</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pointsHistory.map((entry) => (
                          <tr key={entry.id} className="border-b border-slate-100 last:border-b-0">
                            <td className="px-5 py-4">
                              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                                entry.points >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                              }`}>
                                {entry.points >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {entry.points >= 0 ? 'ได้รับแต้ม' : 'ใช้แต้ม'}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="font-bold text-slate-900">{entry.sourceLabel}</div>
                              <div className="mt-1 text-xs text-slate-400">{entry.sourceType}</div>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-600">
                              {entry.note || (entry.points >= 0 ? 'ได้รับ Point' : 'ใช้ Point')}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <span className={`text-sm font-black ${entry.points >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {entry.points > 0 ? `+${entry.points}` : entry.points}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-600">
                              {formatDate(entry.createdAt, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
                  <div className="mb-2 flex items-center gap-2 text-slate-400">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-bold uppercase tracking-[0.18em]">เรียนจบ</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {enrollments.filter((item) => item.status === 'COMPLETED').length}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
                  <div className="mb-2 flex items-center gap-2 text-slate-400">
                    <TrendingUp size={16} />
                    <span className="text-xs font-bold uppercase tracking-[0.18em]">ได้รับ Point</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-600">
                    {pointsHistory.filter((item) => item.points > 0).reduce((sum, item) => sum + item.points, 0)}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
                  <div className="mb-2 flex items-center gap-2 text-slate-400">
                    <Gift size={16} />
                    <span className="text-xs font-bold uppercase tracking-[0.18em]">ใช้ Point</span>
                  </div>
                  <div className="text-2xl font-black text-rose-600">
                    {Math.abs(pointsHistory.filter((item) => item.points < 0).reduce((sum, item) => sum + item.points, 0))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
