export const canAccessAdminPanel = (user) => {
  if (!user) return false;
  return ['admin', 'manager'].includes(user.role) || user.tier?.accessAdmin === true;
};

export const isSuperAdmin = (user) => user?.role === 'admin';
export const canEditAdminUsers = (user) => user?.role === 'admin';

export const getRoleLabel = (user) => {
  if (user?.role === 'admin') return 'Admin';
  if (user?.role === 'manager' || user?.tier?.accessAdmin) return 'Manager';
  return 'User';
};
