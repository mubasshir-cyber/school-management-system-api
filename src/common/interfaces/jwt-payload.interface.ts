import { DataScope } from '../enums/scope.enum';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  tenantId?: string;
  schoolId?: string;
  branchId?: string;
  roles: string[];
  permissions: string[];
  scope: DataScope;
  staffId?: string;
  studentId?: string;
  guardianId?: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId?: string;
  schoolId?: string;
  branchId?: string;
  roles: string[];
  scope: DataScope;
  iat?: number;
  exp?: number;
}
