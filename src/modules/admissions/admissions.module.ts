import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admission } from './entities/admission.entity';
import { AdmissionsService } from './admissions.service';
import { AdmissionsController } from './admissions.controller';
import { StudentsModule } from '../students/students.module';
import { GuardiansModule } from '../guardians/guardians.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admission]),
    StudentsModule,
    GuardiansModule,
    AuditModule,
  ],
  controllers: [AdmissionsController],
  providers: [AdmissionsService],
  exports: [AdmissionsService],
})
export class AdmissionsModule {}
