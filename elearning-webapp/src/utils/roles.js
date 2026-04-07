export const canAccessAdminPanel = (role) => ['admin', 'manager'].includes(role);

export const canEditAdminUsers = (role) => role === 'admin';

export const getRoleLabel = (role) => {
  if (role === 'admin') return 'Admin';
  if (role === 'manager') return 'Manager';
  return 'User';
};
