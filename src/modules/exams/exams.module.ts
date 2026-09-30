import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamType } from './entities/exam-type.entity';
import { GradingScale } from './entities/grading-scale.entity';
import { Exam } from './entities/exam.entity';
import { ExamSchedule } from './entities/exam-schedule.entity';
import { StudentMark } from './entities/student-mark.entity';
import { ExamResult } from './entities/exam-result.entity';
import { Student } from '../students/entities/student.entity';
import { StudentEnrollment } from '../enrollments/entities/student-enrollment.entity';
import { StudentAttendance } from '../attendance/entities/student-attendance.entity';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExamType,
      GradingScale,
      Exam,
      ExamSchedule,
      StudentMark,
      ExamResult,
      Student,
      StudentEnrollment,
      StudentAttendance,
    ]),
  ],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}
