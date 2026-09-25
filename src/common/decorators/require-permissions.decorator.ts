import { SetMetadata } from '@nestjs/common';
import { DataScope } from '../enums/scope.enum';

export const PERMISSIONS_KEY = 'permissions';
export const SCOPE_KEY = 'scope';

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const RequireScope = (scope: DataScope) => SetMetadata(SCOPE_KEY, scope);
