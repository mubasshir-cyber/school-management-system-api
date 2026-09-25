import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherClassAssignment } from './entities/teacher-class-assignment.entity';
import { TeacherSubjectAssignment } from './entities/teacher-subject-assignment.entity';
import { TeacherAssignmentsService } from './teacher-assignments.service';
import { TeacherAssignmentsController } from './teacher-assignments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TeacherClassAssignment,
      TeacherSubjectAssignment,
    ]),
  ],
  controllers: [TeacherAssignmentsController],
  providers: [TeacherAssignmentsService],
  exports: [TeacherAssignmentsService, TypeOrmModule],
})
export class TeacherAssignmentsModule {}
