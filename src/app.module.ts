import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { typeOrmAsyncConfig } from './config/database.config';
import { AuditModule } from './modules/audit/audit.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { SeedModule } from './modules/seed/seed.module';
import { AcademicYearsModule } from './modules/academic-years/academic-years.module';
import { ClassesModule } from './modules/classes/classes.module';
import { SectionsModule } from './modules/sections/sections.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { ClassSubjectsModule } from './modules/class-subjects/class-subjects.module';
import { TeacherAssignmentsModule } from './modules/teacher-assignments/teacher-assignments.module';
import { StudentsModule } from './modules/students/students.module';
import { GuardiansModule } from './modules/guardians/guardians.module';
import { AdmissionsModule } from './modules/admissions/admissions.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { StudentDocumentsModule } from './modules/student-documents/student-documents.module';
import { StaffModule } from './modules/staff/staff.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { FeesModule } from './modules/fees/fees.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { TreasuryModule } from './modules/treasury/treasury.module';
import { ExamsModule } from './modules/exams/exams.module';
import { TenantGuard } from './common/guards/tenant.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    AuditModule,
    TenantsModule,
    RbacModule,
    UsersModule,
    AuthModule,
    SeedModule,
    AcademicYearsModule,
    ClassesModule,
    SectionsModule,
    SubjectsModule,
    ClassSubjectsModule,
    TeacherAssignmentsModule,
    StudentsModule,
    GuardiansModule,
    AdmissionsModule,
    EnrollmentsModule,
    StudentDocumentsModule,
    StaffModule,
    AttendanceModule,
    FeesModule,
    PayrollModule,
    TreasuryModule,
    ExamsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
})
export class AppModule {}
