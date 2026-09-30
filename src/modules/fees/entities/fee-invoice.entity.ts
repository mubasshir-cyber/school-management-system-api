import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Student } from '../../students/entities/student.entity';
import { AcademicYear } from '../../academic-years/entities/academic-year.entity';
import { FeeInvoiceItem } from './fee-invoice-item.entity';

export enum FeeInvoiceStatus {
  DRAFT = 'DRAFT',
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

@Entity('fee_invoices')
export class FeeInvoice extends BaseEntity {
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

  @Column({ name: 'invoice_number', type: 'varchar', length: 100 })
  invoiceNumber: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ name: 'invoice_date', type: 'date' })
  invoiceDate: string;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ name: 'discount_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'fine_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  fineAmount: number;

  @Column({ name: 'total_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ name: 'paid_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ name: 'balance_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  balanceAmount: number;

  @Column({
    type: 'enum',
    enum: FeeInvoiceStatus,
    default: FeeInvoiceStatus.UNPAID,
  })
  status: FeeInvoiceStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => FeeInvoiceItem, (item) => item.feeInvoice, { cascade: true })
  items: FeeInvoiceItem[];
}
