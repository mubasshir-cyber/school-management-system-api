import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { TenantGuard } from './tenant.guard';
import { DefaultRole } from '../enums/role.enum';
import { DataScope } from '../enums/scope.enum';

describe('TenantGuard', () => {
  let guard: TenantGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new TenantGuard(reflector);
  });

  const createMockContext = (user: any, headers = {}, query = {}, body = {}) => {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          headers,
          query,
          body,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow access if route is public', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const context = createMockContext(null);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should prohibit cross-tenant access for non-superadmin users', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const context = createMockContext(
      {
        userId: 'user-1',
        tenantId: 'tenant-a',
        schoolId: 'school-a',
        roles: [DefaultRole.TEACHER],
        scope: DataScope.CLASS,
      },
      { 'x-tenant-id': 'tenant-b' },
    );

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow superadmin cross-tenant access', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const context = createMockContext(
      {
        userId: 'admin-1',
        tenantId: 'tenant-a',
        schoolId: 'school-a',
        roles: [DefaultRole.SUPER_ADMIN],
        scope: DataScope.ORGANIZATION,
      },
      { 'x-tenant-id': 'tenant-b' },
    );

    expect(guard.canActivate(context)).toBe(true);
  });
});
