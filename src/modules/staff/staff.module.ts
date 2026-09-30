import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { Designation } from './entities/designation.entity';
import { Staff } from './entities/staff.entity';
import { StaffDocument } from './entities/staff-document.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../rbac/entities/role.entity';
import { UserRole } from '../rbac/entities/user-role.entity';

import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { DesignationsService } from './designations.service';
import { DesignationsController } from './designations.controller';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { StaffDocumentsService } from './staff-documents.service';
import { StaffDocumentsController } from './staff-documents.controller';
import { AuditModule } from '../audit/audit.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department,
      Designation,
      Staff,
      StaffDocument,
      User,
      Role,
      UserRole,
    ]),
    AuditModule,
    StudentsModule,
  ],
  controllers: [
    DepartmentsController,
    DesignationsController,
    StaffController,
    StaffDocumentsController,
  ],
  providers: [
    DepartmentsService,
    DesignationsService,
    StaffService,
    StaffDocumentsService,
  ],
  exports: [StaffService, DepartmentsService, DesignationsService, StaffDocumentsService],
})
export class StaffModule {}
