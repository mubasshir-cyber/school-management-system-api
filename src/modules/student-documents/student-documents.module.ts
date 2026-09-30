import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentDocument } from './entities/student-document.entity';
import { Student } from '../students/entities/student.entity';
import { StudentDocumentsService } from './student-documents.service';
import { StudentDocumentsController } from './student-documents.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentDocument, Student]),
    AuditModule,
  ],
  controllers: [StudentDocumentsController],
  providers: [StudentDocumentsService],
  exports: [StudentDocumentsService],
})
export class StudentDocumentsModule {}
