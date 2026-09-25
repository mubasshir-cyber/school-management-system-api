import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PERMISSIONS_KEY,
  SCOPE_KEY,
} from '../decorators/require-permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthenticatedUser } from '../interfaces/jwt-payload.interface';
import { DefaultRole } from '../enums/role.enum';
import { DataScope } from '../enums/scope.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredScope = this.reflector.getAllAndOverride<DataScope>(
      SCOPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions && !requiredScope) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    if (!user) {
      throw new ForbiddenException('Access denied: Unauthorized user');
    }

    // Super Admin has unrestricted bypass
    if (user.roles?.includes(DefaultRole.SUPER_ADMIN)) {
      return true;
    }

    // Evaluate permissions
    if (requiredPermissions && requiredPermissions.length > 0) {
      const userPermissions = new Set(user.permissions || []);
      const hasAllPermissions = requiredPermissions.every((perm) =>
        userPermissions.has(perm),
      );

      if (!hasAllPermissions) {
        throw new ForbiddenException(
          `Access denied: Missing required permission(s) [${requiredPermissions.join(', ')}]`,
        );
      }
    }

    // Evaluate scope constraints
    if (requiredScope) {
      const scopeHierarchy = [
        DataScope.ORGANIZATION,
        DataScope.BRANCH,
        DataScope.DEPARTMENT,
        DataScope.CLASS,
        DataScope.SECTION,
        DataScope.TEAM,
        DataScope.SELF,
      ];

      const userScopeIndex = scopeHierarchy.indexOf(user.scope);
      const requiredScopeIndex = scopeHierarchy.indexOf(requiredScope);

      // Lower index in hierarchy means broader access
      if (userScopeIndex > requiredScopeIndex) {
        throw new ForbiddenException(
          `Access denied: Current user scope [${user.scope}] is insufficient for required scope [${requiredScope}]`,
        );
      }
    }

    return true;
  }
}
