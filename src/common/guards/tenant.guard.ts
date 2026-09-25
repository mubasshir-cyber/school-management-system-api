import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { TenantContext } from '../context/tenant-context';
import { AuthenticatedUser } from '../interfaces/jwt-payload.interface';
import { DefaultRole } from '../enums/role.enum';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    if (!user) {
      return true;
    }

    // Set TenantContext for downstream services
    TenantContext.run(
      {
        tenantId: user.tenantId,
        schoolId: user.schoolId,
        branchId: user.branchId,
        userId: user.userId,
      },
      () => {},
    );

    // Cross-tenant data isolation verification
    const reqTenantId =
      request.headers['x-tenant-id'] || request.query.tenantId || request.body?.tenantId;
    const reqSchoolId =
      request.headers['x-school-id'] || request.query.schoolId || request.body?.schoolId;

    const isSuperAdmin = user.roles.includes(DefaultRole.SUPER_ADMIN);

    if (!isSuperAdmin) {
      if (reqTenantId && reqTenantId !== user.tenantId) {
        throw new ForbiddenException(
          'Cross-tenant access prohibited: User cannot access other tenant resources',
        );
      }

      if (reqSchoolId && reqSchoolId !== user.schoolId) {
        throw new ForbiddenException(
          'Cross-school access prohibited: User cannot access other school resources',
        );
      }
    }

    return true;
  }
}
