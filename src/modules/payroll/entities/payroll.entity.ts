import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AcademicYear } from '../../academic-years/entities/academic-year.entity';
import { User } from '../../users/entities/user.entity';
import { PayrollItem } from './payroll-item.entity';

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  CALCULATED = 'CALCULATED',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

@Entity('payrolls')
export class Payroll extends BaseEntity {
  @Column({ name: 'academic_year_id', type: 'uuid', nullable: true })
  academicYearId?: string;

  @ManyToOne(() => AcademicYear, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear?: AcademicYear;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ name: 'payroll_title', type: 'varchar', length: 200 })
  payrollTitle: string;

  @Column({ name: 'total_staff_count', type: 'int', default: 0 })
  totalStaffCount: number;

  @Column({ name: 'total_gross_amount', type: 'numeric', precision: 14, scale: 2, default: 0 })
  totalGrossAmount: number;

  @Column({ name: 'total_deductions_amount', type: 'numeric', precision: 14, scale: 2, default: 0 })
  totalDeductionsAmount: number;

  @Column({ name: 'total_net_amount', type: 'numeric', precision: 14, scale: 2, default: 0 })
  totalNetAmount: number;

  @Column({
    type: 'enum',
    enum: PayrollStatus,
    default: PayrollStatus.DRAFT,
  })
  status: PayrollStatus;

  @Column({ name: 'processed_by', type: 'uuid', nullable: true })
  processedBy?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'processed_by' })
  processedByUser?: User;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approved_by' })
  approvedByUser?: User;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => PayrollItem, (item) => item.payroll, { cascade: true })
  items: PayrollItem[];
}
