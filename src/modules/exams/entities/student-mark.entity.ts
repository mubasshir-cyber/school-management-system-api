import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ExamSchedule } from './exam-schedule.entity';
import { Student } from '../../students/entities/student.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { StudentMarkStatus } from '../exams.enums';

@Entity('student_marks')
export class StudentMark extends BaseEntity {
  @Column({ name: 'exam_schedule_id', type: 'uuid' })
  examScheduleId: string;

  @ManyToOne(() => ExamSchedule, (schedule) => schedule.marks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exam_schedule_id' })
  examSchedule: ExamSchedule;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'theory_marks', type: 'numeric', precision: 6, scale: 2, default: 0.0 })
  theoryMarks: number;

  @Column({ name: 'practical_marks', type: 'numeric', precision: 6, scale: 2, default: 0.0 })
  practicalMarks: number;

  @Column({ name: 'internal_marks', type: 'numeric', precision: 6, scale: 2, default: 0.0 })
  internalMarks: number;

  @Column({ name: 'total_marks', type: 'numeric', precision: 6, scale: 2 })
  totalMarks: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  grade?: string;

  @Column({ name: 'gpa_point', type: 'numeric', precision: 4, scale: 2, nullable: true })
  gpaPoint?: number;

  @Column({ name: 'is_absent', type: 'boolean', default: false })
  isAbsent: boolean;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @Column({
    type: 'enum',
    enum: StudentMarkStatus,
    default: StudentMarkStatus.DRAFT,
  })
  status: StudentMarkStatus;

  @Column({ name: 'evaluated_by_staff_id', type: 'uuid', nullable: true })
  evaluatedByStaffId?: string;

  @ManyToOne(() => Staff, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'evaluated_by_staff_id' })
  evaluatedByStaff?: Staff;
}
