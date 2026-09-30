import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AdmissionStatus } from '../../../common/enums/status.enum';
import { Student } from '../../students/entities/student.entity';
import { AcademicYear } from '../../academic-years/entities/academic-year.entity';
import { ClassEntity } from '../../classes/entities/class.entity';
import { Section } from '../../sections/entities/section.entity';
import { User } from '../../users/entities/user.entity';

@Entity('admissions')
export class Admission extends BaseEntity {
  @Column({ name: 'application_number', type: 'varchar', length: 50 })
  applicationNumber: string;

  @Column({ name: 'student_id', type: 'uuid', nullable: true })
  studentId?: string;

  @Column({ name: 'academic_year_id', type: 'uuid' })
  academicYearId: string;

  @Column({ name: 'class_id', type: 'uuid' })
  classId: string;

  @Column({ name: 'preferred_section_id', type: 'uuid', nullable: true })
  preferredSectionId?: string;

  @Column({ name: 'application_date', type: 'date', default: () => 'CURRENT_DATE' })
  applicationDate: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AdmissionStatus,
    default: AdmissionStatus.DRAFT,
  })
  status: AdmissionStatus;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: string;

  @Column({ name: 'gender', type: 'varchar', length: 20 })
  gender: string;

  @Column({ name: 'guardian_name', type: 'varchar', length: 100 })
  guardianName: string;

  @Column({ name: 'guardian_mobile', type: 'varchar', length: 20 })
  guardianMobile: string;

  @Column({ name: 'guardian_email', type: 'varchar', length: 150, nullable: true })
  guardianEmail?: string;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy?: string;

  @Column({ name: 'reviewed_at', type: 'timestamptz', nullable: true })
  reviewedAt?: Date;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'rejected_by', type: 'uuid', nullable: true })
  rejectedBy?: string;

  @Column({ name: 'rejected_at', type: 'timestamptz', nullable: true })
  rejectedAt?: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => Student, (student) => student.admissions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'student_id' })
  student?: Student;

  @ManyToOne(() => AcademicYear)
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;

  @ManyToOne(() => ClassEntity)
  @JoinColumn({ name: 'class_id' })
  class: ClassEntity;

  @ManyToOne(() => Section, { nullable: true })
  @JoinColumn({ name: 'preferred_section_id' })
  preferredSection?: Section;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver?: User;
}
