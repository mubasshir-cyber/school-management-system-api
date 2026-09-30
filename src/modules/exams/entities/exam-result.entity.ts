import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Exam } from './exam.entity';
import { Student } from '../../students/entities/student.entity';
import { AcademicYear } from '../../academic-years/entities/academic-year.entity';
import { ClassEntity } from '../../classes/entities/class.entity';
import { Section } from '../../sections/entities/section.entity';
import { ResultStatus } from '../exams.enums';

@Entity('exam_results')
export class ExamResult extends BaseEntity {
  @Column({ name: 'exam_id', type: 'uuid' })
  examId: string;

  @ManyToOne(() => Exam, (exam) => exam.results, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'academic_year_id', type: 'uuid' })
  academicYearId: string;

  @ManyToOne(() => AcademicYear, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;

  @Column({ name: 'class_id', type: 'uuid' })
  classId: string;

  @ManyToOne(() => ClassEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class: ClassEntity;

  @Column({ name: 'section_id', type: 'uuid', nullable: true })
  sectionId?: string;

  @ManyToOne(() => Section, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'section_id' })
  section?: Section;

  @Column({ name: 'total_max_marks', type: 'numeric', precision: 8, scale: 2 })
  totalMaxMarks: number;

  @Column({ name: 'total_marks_obtained', type: 'numeric', precision: 8, scale: 2 })
  totalMarksObtained: number;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  percentage: number;

  @Column({ type: 'numeric', precision: 4, scale: 2, nullable: true })
  gpa?: number;

  @Column({ name: 'overall_grade', type: 'varchar', length: 10 })
  overallGrade: string;

  @Column({
    name: 'result_status',
    type: 'enum',
    enum: ResultStatus,
    default: ResultStatus.PASSED,
  })
  resultStatus: ResultStatus;

  @Column({ type: 'int', nullable: true })
  rank?: number;

  @Column({ name: 'attendance_percentage', type: 'numeric', precision: 5, scale: 2, nullable: true })
  attendancePercentage?: number;

  @Column({ name: 'teacher_remarks', type: 'text', nullable: true })
  teacherRemarks?: string;

  @Column({ name: 'principal_remarks', type: 'text', nullable: true })
  principalRemarks?: string;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt?: Date;
}
