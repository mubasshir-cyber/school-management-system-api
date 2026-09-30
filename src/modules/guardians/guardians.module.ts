import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guardian } from './entities/guardian.entity';
import { StudentGuardian } from './entities/student-guardian.entity';
import { Student } from '../students/entities/student.entity';
import { GuardiansService } from './guardians.service';
import { GuardiansController } from './guardians.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Guardian, StudentGuardian, Student]),
    AuditModule,
  ],
  controllers: [GuardiansController],
  providers: [GuardiansService],
  exports: [GuardiansService],
})
export class GuardiansModule {}
