import React, { useEffect, useMemo, useState } from 'react';
import { 
  Users, BookOpen, CheckCircle, TrendingUp, BarChart2, 
  PieChart as PieIcon, ChevronRight, X 
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { adminAPI } from '../../utils/api';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { canEditAdminUsers } from '../../utils/roles';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

const TYPE_COLORS = {
  'LEADERSHIP': '#6366f1',
  'FUNCTION': '#94a3b8',
  'INNOVATION': '#f59e0b'
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const currentUser = useMemo(() => JSON.parse(localStorage.getItem('user') || 'null'), []);
  const isFullAdmin = canEditAdminUsers(currentUser);

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
    { title: isFullAdmin ? 'ผู้เรียนทั้งหมด' : 'ผู้เรียนในแผนก', value: stats?.totalUsers || 0, icon: <Users size={24}/>, color: 'text-primary', bg: 'bg-primary-light', trend: '+12%' },
    { title: isFullAdmin ? 'คอร์สที่เปิดใช้งาน' : 'คอร์สที่แผนกเห็นได้', value: stats?.activeCourses || 0, icon: <BookOpen size={24}/>, color: 'text-warning', bg: 'bg-orange-50', trend: '+2' },
    { title: isFullAdmin ? 'การลงทะเบียนรวม' : 'การลงทะเบียนของแผนก', value: stats?.totalEnrollments || 0, icon: <CheckCircle size={24}/>, color: 'text-success', bg: 'bg-green-50', trend: '+18%' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <AdminPageHeader
        title={isFullAdmin ? 'แดชบอร์ดผู้ดูแลระบบ' : `แดชบอร์ดแผนก ${stats?.department || currentUser?.department || ''}`}
        subtitle={isFullAdmin
          ? 'สรุปผลลัพธ์และสถิติการใช้งานระบบ e-Learning ขององค์กร'
          : 'ภาพรวมการเรียนของผู้ใช้ในแผนกที่คุณดูแล'}
        actions={isFullAdmin ? (
          <button className="btn btn-primary shadow-lg shadow-primary/20">
            ออกรายงาน PDF
          </button>
        ) : null}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="card p-6 flex items-center gap-5 hover:border-primary/20 transition-all group">
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-muted text-xs font-black uppercase tracking-wider mb-1">{stat.title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black">{stat.value.toLocaleString()}</h3>
                <span className="flex items-center text-success text-xs font-bold">
                  <TrendingUp size={12} className="mr-0.5" /> {stat.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card flex min-w-0 flex-col p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <BarChart2 size={20} className="text-primary" />
              <h3 className="text-lg font-bold">สถิติการลงทะเบียน (7 วันล่าสุด)</h3>
            </div>
          </div>
          
          <div className="relative h-[300px] w-full min-w-0 overflow-hidden">
            {stats && (
              <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={300}>
                <BarChart data={stats?.weeklyActivity || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1">
          <div className="card flex min-w-0 flex-col p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <PieIcon size={20} className="text-indigo-600" />
                <h3 className="text-lg font-bold">สถิติตามกลุ่มหลัก (Major Group)</h3>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-md">คลิกดูรายละเอียด</span>
            </div>
            
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="relative h-[220px] w-full max-w-[220px] shrink-0 min-w-0">
                {stats && (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={stats?.typeDistribution || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={8}
                        dataKey="value"
                        onClick={(data) => setSelectedGroup(data)}
                        className="cursor-pointer outline-none"
                      >
                        {(stats?.typeDistribution || []).map((entry, index) => (
                           <Cell 
                             key={`cell-${index}`} 
                             fill={TYPE_COLORS[entry.name.toUpperCase()] || COLORS[index % COLORS.length]} 
                             className="hover:opacity-80 transition-opacity outline-none"
                           />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                        formatter={(value, name) => [`${value} คอร์ส`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Major Groups</p>
                  <p className="text-2xl font-black text-slate-800 leading-none">{(stats?.typeDistribution || []).length}</p>
                </div>
              </div>

              <div className="flex-1 w-full space-y-3">
                {(stats?.typeDistribution || []).map((type, i) => (
                  <button 
                    key={type.name} 
                    onClick={() => setSelectedGroup(type)}
                    className="flex items-center justify-between w-full p-3 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full shadow-sm" style={{ backgroundColor: TYPE_COLORS[type.name.toUpperCase()] || COLORS[i % COLORS.length] }}></div>
                      <div className="flex flex-col items-start translate-y-[-1px]">
                         <span className="text-sm font-bold text-slate-900 leading-none">{type.name}</span>
                         <span className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tight">{type.enrollmentCount.toLocaleString()} Enrollments</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-800">{type.value}</span>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card flex min-w-0 flex-col p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieIcon size={20} className="text-warning" />
            <h3 className="text-lg font-bold">สัดส่วนตามหมวดหมู่ (Categories)</h3>
          </div>
          
          <div className="relative h-[250px] w-full min-w-0 overflow-hidden">
            {stats && (
              <ResponsiveContainer width="100%" height={250} minWidth={0} minHeight={250}>
                <PieChart>
                  <Pie
                    data={stats?.categoryDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(stats?.categoryDistribution || []).map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-[10px] font-black text-muted uppercase">ทั้งหมด</p>
              <p className="text-xl font-black">{stats?.activeCourses || 0}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {(stats?.categoryDistribution || []).slice(0, 4).map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-slate-600 truncate max-w-[120px]">{cat.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-800">{cat.value} คอร์ส</span>
              </div>
            ))}
          </div>
        </div>

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
                {(stats?.popularCourses || []).map((course, i) => (
                  <tr key={course.id} className="border-b border-gray-50 last:border-0 group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">#{i + 1}</div>
                        <span className="font-bold text-sm group-hover:text-primary transition-colors">{course.title}</span>
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
      </div>

      {/* Group Detail Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md animate-fade-in focus:outline-none outline-none">
           <div className="card w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-slide-up shadow-2xl focus:outline-none outline-none">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: TYPE_COLORS[selectedGroup.name.toUpperCase()] || '#4f46e5' }}>
                       <TrendingUp size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-slate-900">รายละเอียดกลุ่ม {selectedGroup.name}</h3>
                       <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">ข้อมูลสถิติแยกตามรายคอร์ส</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => setSelectedGroup(null)}
                   className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                 >
                    <X size={20} />
                 </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50/50 border-b border-slate-100">
                 <div className="card p-4 bg-white border-slate-100 shadow-sm flex flex-col gap-1 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">คอร์สทั้งหมด</p>
                    <p className="text-2xl font-black text-slate-800 leading-none">{selectedGroup.value}</p>
                 </div>
                 <div className="card p-4 bg-white border-slate-100 shadow-sm flex flex-col gap-1 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">จำนวนผู้เรียนรวม</p>
                    <p className="text-2xl font-black text-primary leading-none">{selectedGroup.enrollmentCount.toLocaleString()}</p>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 no-scrollbar h-full">
                 <h4 className="mb-4 text-xs font-black text-slate-400 uppercase tracking-widest">รายชื่อคอร์สในกลุ่มนี้</h4>
                 <div className="space-y-3">
                    {selectedGroup.courses && [...selectedGroup.courses].sort((a,b) => b.students - a.students).map((course, idx) => (
                      <div key={course.id} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-white border border-slate-100 hover:border-primary/20 hover:shadow-md transition-all group">
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 text-xs font-black group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                               #{idx + 1}
                            </div>
                            <span className="text-sm font-bold text-slate-800 line-clamp-1">{course.title}</span>
                         </div>
                         <div className="flex flex-col items-end shrink-0">
                            <span className="text-xs font-black text-slate-900">{course.students.toLocaleString()} คน</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ลงทะเบียนแล้ว</span>
                         </div>
                      </div>
                    ))}
                    {(!selectedGroup.courses || selectedGroup.courses.length === 0) && (
                       <div className="py-20 text-center">
                          <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                          <p className="text-sm font-bold text-slate-400">ยังไม่มีคอร์สในกลุ่มนี้</p>
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
