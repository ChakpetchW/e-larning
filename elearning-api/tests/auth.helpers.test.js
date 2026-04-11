const authHelpers = require('../src/utils/auth.helpers');

// Minimal mock prisma for testing
const mockPrisma = {
  user: {
    findUnique: jest.fn()
  }
};

describe('auth.helpers', () => {
  describe('getActorContext', () => {
    it('should resolve actor context for admin', async () => {
      const authUser = { userId: 'admin-1', role: 'admin' };
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'admin-1',
        role: 'admin',
        departmentId: null
      });

      const actor = await authHelpers.getActorContext(mockPrisma, authUser);
      expect(actor.role).toBe('admin');
    });

    it('should resolve actor context for manager with department', async () => {
      const authUser = { userId: 'mgr-1', role: 'manager' };
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'mgr-1',
        role: 'manager',
        departmentId: 'dept-A'
      });

      const actor = await authHelpers.getActorContext(mockPrisma, authUser);
      expect(actor.departmentId).toBe('dept-A');
    });
  });

  describe('canAccessEntity', () => {
    it('should allow admin access to everything', () => {
      const actor = { role: 'admin' };
      const entity = { isTemporary: false, status: 'DRAFT' };
      expect(authHelpers.canAccessEntity(actor, entity)).toBe(true);
    });

    it('should deny user access to expired temporary content', () => {
      const actor = { role: 'user', departmentId: 'dept-A' };
      const entity = { 
        isTemporary: true, 
        expiredAt: new Date(Date.now() - 10000),
        status: 'PUBLISHED',
        visibleToAll: true
      };
      expect(authHelpers.canAccessEntity(actor, entity)).toBe(false);
    });

    it('should allow user access to department-scoped content', () => {
      const actor = { role: 'user', departmentId: 'dept-A' };
      const entity = { 
        status: 'PUBLISHED',
        visibleToAll: false,
        departmentAccess: [{ departmentId: 'dept-A' }]
      };
      expect(authHelpers.canAccessEntity(actor, entity)).toBe(true);
    });
  });
});
