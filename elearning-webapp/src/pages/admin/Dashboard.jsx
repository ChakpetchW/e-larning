import React, { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../../utils/api';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { canEditAdminUsers } from '../../utils/roles';

// Sub-components
import StatCards from '../../components/admin/StatCards';
import WeeklyActivityChart from '../../components/admin/WeeklyActivityChart';
import MajorGroupChart from '../../components/admin/MajorGroupChart';
import CategoryDistributionChart from '../../components/admin/CategoryDistributionChart';
import PopularCoursesTable from '../../components/admin/PopularCoursesTable';
import GroupDetailModal from '../../components/admin/GroupDetailModal';

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
          <button type="button" className="btn btn-primary shadow-lg shadow-primary/20">
            ออกรายงาน PDF
          </button>
        ) : null}
      />

      <StatCards 
        stats={stats} 
        isFullAdmin={isFullAdmin} 
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WeeklyActivityChart 
          data={stats?.weeklyActivity} 
        />

        <MajorGroupChart 
          data={stats?.typeDistribution}
          onSelectGroup={setSelectedGroup}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <CategoryDistributionChart 
          data={stats?.categoryDistribution}
          totalCourses={stats?.activeCourses}
        />

        <PopularCoursesTable 
          courses={stats?.popularCourses}
        />
      </div>

      <GroupDetailModal 
        selectedGroup={selectedGroup}
        onClose={() => setSelectedGroup(null)}
      />
    </div>
  );
};

export default Dashboard;
