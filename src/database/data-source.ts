import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { Tenant } from '../modules/tenants/entities/tenant.entity';
import { School } from '../modules/tenants/entities/school.entity';
import { Branch } from '../modules/tenants/entities/branch.entity';
import { SchoolSettings } from '../modules/tenants/entities/school-settings.entity';
import { User } from '../modules/users/entities/user.entity';
import { UserSession } from '../modules/users/entities/user-session.entity';
import { Role } from '../modules/rbac/entities/role.entity';
import { Permission } from '../modules/rbac/entities/permission.entity';
import { RolePermission } from '../modules/rbac/entities/role-permission.entity';
import { UserRole } from '../modules/rbac/entities/user-role.entity';
import { RefreshToken } from '../modules/auth/entities/refresh-token.entity';
import { AuditLog } from '../modules/audit/entities/audit-log.entity';
import { AcademicYear } from '../modules/academic-years/entities/academic-year.entity';
import { ClassEntity } from '../modules/classes/entities/class.entity';
import { Section } from '../modules/sections/entities/section.entity';
import { Subject } from '../modules/subjects/entities/subject.entity';
import { ClassSubject } from '../modules/class-subjects/entities/class-subject.entity';
import { TeacherClassAssignment } from '../modules/teacher-assignments/entities/teacher-class-assignment.entity';
import { TeacherSubjectAssignment } from '../modules/teacher-assignments/entities/teacher-subject-assignment.entity';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'school_erp_db',
  entities: [
    Tenant,
    School,
    Branch,
    SchoolSettings,
    User,
    UserSession,
    Role,
    Permission,
    RolePermission,
    UserRole,
    RefreshToken,
    AuditLog,
    AcademicYear,
    ClassEntity,
    Section,
    Subject,
    ClassSubject,
    TeacherClassAssignment,
    TeacherSubjectAssignment,
  ],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
