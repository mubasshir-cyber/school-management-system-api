import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { NumberingSequence } from './entities/numbering-sequence.entity';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { NumberingSequenceService } from './services/numbering-sequence.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, NumberingSequence]),
    AuditModule,
  ],
  controllers: [StudentsController],
  providers: [StudentsService, NumberingSequenceService],
  exports: [StudentsService, NumberingSequenceService],
})
export class StudentsModule {}
