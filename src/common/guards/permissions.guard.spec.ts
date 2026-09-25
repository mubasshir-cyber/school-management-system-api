import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PermissionsGuard } from './permissions.guard';
import { DefaultRole } from '../enums/role.enum';
import { DataScope } from '../enums/scope.enum';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  const createMockContext = (user: any) => {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow access if user possesses required permission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === 'permissions') return ['student.profile.create'];
      return undefined;
    });

    const context = createMockContext({
      userId: 'user-1',
      roles: [DefaultRole.STAFF],
      permissions: ['student.profile.create', 'student.profile.read'],
      scope: DataScope.ORGANIZATION,
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user lacks required permission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => {
      if (key === 'permissions') return ['fee.payment.refund'];
      return undefined;
    });

    const context = createMockContext({
      userId: 'user-1',
      roles: [DefaultRole.TEACHER],
      permissions: ['attendance.student.create'],
      scope: DataScope.CLASS,
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
