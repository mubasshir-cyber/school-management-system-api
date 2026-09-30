import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Student } from '../../students/entities/student.entity';
import { FeeInvoice } from './fee-invoice.entity';
import { User } from '../../users/entities/user.entity';

export enum FeePaymentMethod {
  CASH = 'CASH',
  UPI = 'UPI',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
  ONLINE = 'ONLINE',
}

export enum FeePaymentStatus {
  SUCCESS = 'SUCCESS',
  PENDING = 'PENDING',
  BOUNCED = 'BOUNCED',
  REVERSED = 'REVERSED',
}

@Entity('fee_payments')
export class FeePayment extends BaseEntity {
  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'fee_invoice_id', type: 'uuid', nullable: true })
  feeInvoiceId?: string;

  @ManyToOne(() => FeeInvoice, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fee_invoice_id' })
  feeInvoice?: FeeInvoice;

  @Column({ name: 'receipt_number', type: 'varchar', length: 100 })
  receiptNumber: string;

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  amount: number;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: FeePaymentMethod,
    default: FeePaymentMethod.CASH,
  })
  paymentMethod: FeePaymentMethod;

  @Column({ name: 'transaction_reference', type: 'varchar', length: 150, nullable: true })
  transactionReference?: string;

  @Column({ name: 'cheque_number', type: 'varchar', length: 100, nullable: true })
  chequeNumber?: string;

  @Column({ name: 'bank_name', type: 'varchar', length: 150, nullable: true })
  bankName?: string;

  @Column({
    type: 'enum',
    enum: FeePaymentStatus,
    default: FeePaymentStatus.SUCCESS,
  })
  status: FeePaymentStatus;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @Column({ name: 'received_by_id', type: 'uuid', nullable: true })
  receivedById?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'received_by_id' })
  receivedBy?: User;
}
