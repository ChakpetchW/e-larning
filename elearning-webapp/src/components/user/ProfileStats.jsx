import React from 'react';
import { Award, Shield, User as UserIcon } from 'lucide-react';
import { getRoleLabel } from '../../utils/roles';

const ProfileStats = ({ user, points }) => {
  const statBoxes = [
    {
      label: 'แต้มสะสม',
      value: points.toLocaleString(),
      icon: <Award size={18} className="text-warning" />,
      color: 'text-warning',
      bg: 'bg-orange-50',
    },
    {
      label: 'สถานะ',
      value: user?.status === 'ACTIVE' ? 'ปกติ' : '-',
      icon: <Shield size={18} className="text-primary" />,
      color: 'text-primary',
      bg: 'bg-indigo-50',
    },
    {
      label: 'บทบาท',
      value: getRoleLabel(user),
      icon: <UserIcon size={18} className="text-success" />,
      color: 'text-success',
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {statBoxes.map((stat) => (
        <div
          key={stat.label}
          className="card flex flex-col items-center justify-center gap-1.5 border border-gray-100 bg-white p-4 text-center transition-colors hover:border-gray-200"
        >
          <div className={`mb-1 rounded-full p-2 ${stat.bg}`}>{stat.icon}</div>
          <h4 className={`w-full px-1 text-[1.15rem] font-black leading-tight ${stat.color}`}>
            {stat.value}
          </h4>
          <p className="text-[11px] font-bold tracking-[0.04em] text-gray-500">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ProfileStats;
