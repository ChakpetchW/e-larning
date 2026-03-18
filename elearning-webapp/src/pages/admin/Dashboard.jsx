import React, { useState, useEffect } from 'react';
import { Users, BookOpen, CheckCircle, TrendingUp } from 'lucide-react';
import { adminAPI } from '../../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getDashboardStats();
        setStats(response.data);
      } catch (error) {
        console.error('Fetch dashboard stats error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'ผู้เรียนทั้งหมด', value: stats?.totalUsers || 0, icon: <Users size={24}/>, color: 'text-primary', bg: 'bg-primary-light', trend: '+0%' },
    { title: 'คอร์สเรียน Active', value: stats?.activeCourses || 0, icon: <BookOpen size={24}/>, color: 'text-warning', bg: 'bg-orange-100', trend: '+0' },
    { title: 'จำนวนการลงทะเบียน', value: stats?.totalEnrollments || 0, icon: <CheckCircle size={24}/>, color: 'text-success', bg: 'bg-green-100', trend: '+0%' },
  ];

  if (loading) {
     return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
     );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold mb-1">ภาพรวมระบบ (Dashboard)</h2>
          <p className="text-muted text-sm">ข้อมูลสรุปการเรียนรู้ของบุคลากรในองค์กร</p>
        </div>
        <button className="btn btn-outline text-sm">ดาวน์โหลดรายงาน</button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="card p-5 flex items-center gap-4">
            <div className={`p-4 rounded-full ${stat.bg} ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-muted text-sm font-medium">{stat.title}</p>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl font-bold">{stat.value}</h3>
                <span className="flex items-center text-success text-xs font-bold mb-1">
                  <TrendingUp size={12} className="mr-0.5" /> {stat.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mock Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 min-h-[300px] flex flex-col">
          <h3 className="text-lg font-bold mb-4">สถิติการเข้าเรียน (สัปดาห์นี้)</h3>
          <div className="flex-1 bg-gray-50 border border-border border-dashed rounded-lg flex items-center justify-center text-muted">
            [ Bar Chart Placeholder ]
          </div>
        </div>

        <div className="card p-6 min-h-[300px] flex flex-col">
          <h3 className="text-lg font-bold mb-4">คอร์สยอดนิยม</h3>
          <div className="flex flex-col gap-4">
            {(!stats?.popularCourses || stats.popularCourses.length === 0) ? (
               <div className="flex-1 flex items-center justify-center text-muted italic">ยังไม่มีข้อมูลการเรียน</div>
            ) : (
              stats.popularCourses.map((course, i) => (
                <div key={course.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-primary-light text-primary flex items-center justify-center font-bold">{i + 1}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{course.title}</h4>
                    <p className="text-xs text-muted">ผู้เรียน {course.students} คน</p>
                  </div>
                  <div className="text-sm font-bold text-success">{course.completionRate}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
