import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { IncomeCategory } from './income-category.entity';
import { TreasuryAccount } from './treasury-account.entity';
import { User } from '../../users/entities/user.entity';

@Entity('income_transactions')
export class IncomeTransaction extends BaseEntity {
  @Column({ name: 'income_category_id', type: 'uuid' })
  incomeCategoryId: string;

  @ManyToOne(() => IncomeCategory, (cat) => cat.transactions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'income_category_id' })
  incomeCategory: IncomeCategory;

  @Column({ name: 'treasury_account_id', type: 'uuid', nullable: true })
  treasuryAccountId?: string;

  @ManyToOne(() => TreasuryAccount, (acc) => acc.incomes, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'treasury_account_id' })
  treasuryAccount?: TreasuryAccount;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  amount: number;

  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 50, default: 'BANK_TRANSFER' })
  paymentMethod: string;

  @Column({ name: 'reference_number', type: 'varchar', length: 150, nullable: true })
  referenceNumber?: string;

  @Column({ name: 'payer_name', type: 'varchar', length: 150, nullable: true })
  payerName?: string;

  @Column({ name: 'receipt_number', type: 'varchar', length: 100, nullable: true })
  receiptNumber?: string;

  @Column({ name: 'document_url', type: 'text', nullable: true })
  documentUrl?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'received_by_id', type: 'uuid', nullable: true })
  receivedById?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'received_by_id' })
  receivedBy?: User;

  @Column({ type: 'varchar', length: 20, default: 'RECEIVED' })
  status: string;
}
