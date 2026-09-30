import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
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
import { NumberingSequence } from '../modules/students/entities/numbering-sequence.entity';
import { Student } from '../modules/students/entities/student.entity';
import { Guardian } from '../modules/guardians/entities/guardian.entity';
import { StudentGuardian } from '../modules/guardians/entities/student-guardian.entity';
import { Admission } from '../modules/admissions/entities/admission.entity';
import { StudentEnrollment } from '../modules/enrollments/entities/student-enrollment.entity';
import { StudentDocument } from '../modules/student-documents/entities/student-document.entity';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => {
    return {
      type: 'postgres',
      host: configService.get<string>('database.host'),
      port: configService.get<number>('database.port'),
      username: configService.get<string>('database.username'),
      password: configService.get<string>('database.password'),
      database: configService.get<string>('database.database'),
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
        NumberingSequence,
        Student,
        Guardian,
        StudentGuardian,
        Admission,
        StudentEnrollment,
        StudentDocument,
      ],
      synchronize: configService.get<boolean>('database.synchronize', false),
      logging: configService.get<boolean>('database.logging', false),
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
      migrationsRun: false,
    };
  },
};
