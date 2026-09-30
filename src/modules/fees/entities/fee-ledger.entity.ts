import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Student } from '../../students/entities/student.entity';
import { AcademicYear } from '../../academic-years/entities/academic-year.entity';
import { FeeType } from './fee-type.entity';
import { FeeInvoice } from './fee-invoice.entity';
import { FeePayment } from './fee-payment.entity';

export enum FeeLedgerEntry {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export enum FeeLedgerCategory {
  INVOICE = 'INVOICE',
  PAYMENT = 'PAYMENT',
  DISCOUNT = 'DISCOUNT',
  WAIVER = 'WAIVER',
  FINE = 'FINE',
  REFUND = 'REFUND',
  ADJUSTMENT = 'ADJUSTMENT',
}

@Entity('fee_ledgers')
export class FeeLedger extends BaseEntity {
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

  @Column({ name: 'transaction_date', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  transactionDate: Date;

  @Column({
    name: 'entry_type',
    type: 'enum',
    enum: FeeLedgerEntry,
  })
  entryType: FeeLedgerEntry;

  @Column({
    type: 'enum',
    enum: FeeLedgerCategory,
  })
  category: FeeLedgerCategory;

  @Column({ name: 'fee_type_id', type: 'uuid', nullable: true })
  feeTypeId?: string;

  @ManyToOne(() => FeeType, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fee_type_id' })
  feeType?: FeeType;

  @Column({ name: 'fee_invoice_id', type: 'uuid', nullable: true })
  feeInvoiceId?: string;

  @ManyToOne(() => FeeInvoice, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fee_invoice_id' })
  feeInvoice?: FeeInvoice;

  @Column({ name: 'fee_payment_id', type: 'uuid', nullable: true })
  feePaymentId?: string;

  @ManyToOne(() => FeePayment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fee_payment_id' })
  feePayment?: FeePayment;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  amount: number;

  @Column({ name: 'balance_after', type: 'numeric', precision: 12, scale: 2, default: 0 })
  balanceAfter: number;

  @Column({ name: 'reference_number', type: 'varchar', length: 100, nullable: true })
  referenceNumber?: string;

  @Column({ type: 'text' })
  description: string;
}
