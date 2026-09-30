import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AcademicYear } from '../../academic-years/entities/academic-year.entity';
import { Student } from '../../students/entities/student.entity';
import { FeeStructure } from './fee-structure.entity';
import { FeeDiscount } from './fee-discount.entity';

@Entity('student_fee_assignments')
export class StudentFeeAssignment extends BaseEntity {
  @Column({ name: 'academic_year_id', type: 'uuid' })
  academicYearId: string;

  @ManyToOne(() => AcademicYear, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'fee_structure_id', type: 'uuid' })
  feeStructureId: string;

  @ManyToOne(() => FeeStructure, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'fee_structure_id' })
  feeStructure: FeeStructure;

  @Column({ name: 'fee_discount_id', type: 'uuid', nullable: true })
  feeDiscountId?: string;

  @ManyToOne(() => FeeDiscount, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fee_discount_id' })
  feeDiscount?: FeeDiscount;

  @Column({ name: 'custom_discount_amount', type: 'numeric', precision: 10, scale: 2, default: 0 })
  customDiscountAmount: number;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;
}
