import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { EnrollmentStatus } from '../../../common/enums/status.enum';
import { Student } from '../../students/entities/student.entity';
import { AcademicYear } from '../../academic-years/entities/academic-year.entity';
import { ClassEntity } from '../../classes/entities/class.entity';
import { Section } from '../../sections/entities/section.entity';

@Entity('student_enrollments')
export class StudentEnrollment extends BaseEntity {
  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'academic_year_id', type: 'uuid' })
  academicYearId: string;

  @Column({ name: 'class_id', type: 'uuid' })
  classId: string;

  @Column({ name: 'section_id', type: 'uuid' })
  sectionId: string;

  @Column({ name: 'roll_number', type: 'varchar', length: 50, nullable: true })
  rollNumber?: string;

  @Column({ name: 'enrollment_date', type: 'date', default: () => 'CURRENT_DATE' })
  enrollmentDate: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;

  @Column({ name: 'promotion_status', type: 'varchar', length: 50, nullable: true })
  promotionStatus?: string;

  @Column({ name: 'start_date', type: 'date', default: () => 'CURRENT_DATE' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: string;

  @ManyToOne(() => Student, (student) => student.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => AcademicYear)
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;

  @ManyToOne(() => ClassEntity)
  @JoinColumn({ name: 'class_id' })
  class: ClassEntity;

  @ManyToOne(() => Section)
  @JoinColumn({ name: 'section_id' })
  section: Section;
}
