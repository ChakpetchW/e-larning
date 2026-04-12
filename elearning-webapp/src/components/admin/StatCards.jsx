import React from 'react';
import { Users, BookOpen, CheckCircle, TrendingUp } from 'lucide-react';

const StatCards = ({ stats, isFullAdmin }) => {
  const statCardsData = [
    { 
      title: isFullAdmin ? 'ผู้เรียนทั้งหมด' : 'ผู้เรียนในแผนก', 
      value: stats?.totalUsers || 0, 
      icon: <Users size={24}/>, 
      color: 'text-primary', 
      bg: 'bg-primary-light', 
      trend: '+12%' 
    },
    { 
      title: isFullAdmin ? 'คอร์สที่เปิดใช้งาน' : 'คอร์สที่แผนกเห็นได้', 
      value: stats?.activeCourses || 0, 
      icon: <BookOpen size={24}/>, 
      color: 'text-warning', 
      bg: 'bg-warning-bg', 
      trend: '+2' 
    },
    { 
      title: isFullAdmin ? 'การลงทะเบียนรวม' : 'การลงทะเบียนของแผนก', 
      value: stats?.totalEnrollments || 0, 
      icon: <CheckCircle size={24}/>, 
      color: 'text-success', 
      bg: 'bg-success-bg', 
      trend: '+18%' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statCardsData.map((stat) => (
        <div key={stat.title} className="card p-6 flex items-center gap-5 card-no-lift hover:border-primary/20 transition-all group">
          <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-transform`}>
            {stat.icon}
          </div>
          <div>
            <p className="text-muted text-xs font-black uppercase tracking-wider mb-1 text-left">{stat.title}</p>
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
  );
};

export default StatCards;
