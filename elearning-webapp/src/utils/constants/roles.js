export const USER_ROLES = Object.freeze({
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
});

export const ADMIN_PANEL_ROLES = Object.freeze([
  USER_ROLES.ADMIN,
  USER_ROLES.MANAGER,
]);
