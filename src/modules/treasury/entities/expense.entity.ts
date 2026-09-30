import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ExpenseCategory } from './expense-category.entity';
import { TreasuryAccount } from './treasury-account.entity';
import { User } from '../../users/entities/user.entity';

export enum ExpenseStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Entity('expenses')
export class Expense extends BaseEntity {
  @Column({ name: 'expense_category_id', type: 'uuid' })
  expenseCategoryId: string;

  @ManyToOne(() => ExpenseCategory, (cat) => cat.expenses, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'expense_category_id' })
  expenseCategory: ExpenseCategory;

  @Column({ name: 'treasury_account_id', type: 'uuid', nullable: true })
  treasuryAccountId?: string;

  @ManyToOne(() => TreasuryAccount, (acc) => acc.expenses, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'treasury_account_id' })
  treasuryAccount?: TreasuryAccount;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  amount: number;

  @Column({ name: 'expense_date', type: 'date' })
  expenseDate: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 50, default: 'BANK_TRANSFER' })
  paymentMethod: string;

  @Column({ name: 'voucher_number', type: 'varchar', length: 100 })
  voucherNumber: string;

  @Column({ name: 'payee_name', type: 'varchar', length: 150, nullable: true })
  payeeName?: string;

  @Column({ name: 'vendor_name', type: 'varchar', length: 150, nullable: true })
  vendorName?: string;

  @Column({ name: 'invoice_number', type: 'varchar', length: 100, nullable: true })
  invoiceNumber?: string;

  @Column({ name: 'document_url', type: 'text', nullable: true })
  documentUrl?: string;

  @Column({
    type: 'enum',
    enum: ExpenseStatus,
    default: ExpenseStatus.PENDING,
  })
  status: ExpenseStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'requested_by_id', type: 'uuid', nullable: true })
  requestedById?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'requested_by_id' })
  requestedBy?: User;

  @Column({ name: 'approved_by_id', type: 'uuid', nullable: true })
  approvedById?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approved_by_id' })
  approvedBy?: User;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt?: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt?: Date;
}
