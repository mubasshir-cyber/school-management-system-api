import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PayrollItem } from './payroll-item.entity';

@Entity('salary_payments')
export class SalaryPayment extends BaseEntity {
  @Column({ name: 'payroll_item_id', type: 'uuid' })
  payrollItemId: string;

  @ManyToOne(() => PayrollItem, (pi) => pi.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payroll_item_id' })
  payrollItem: PayrollItem;

  @Column({ name: 'payment_date', type: 'date' })
  paymentDate: string;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  amount: number;

  @Column({ name: 'payment_method', type: 'varchar', length: 50, default: 'BANK_TRANSFER' })
  paymentMethod: string;

  @Column({ name: 'transaction_reference', type: 'varchar', length: 150, nullable: true })
  transactionReference?: string;

  @Column({ type: 'varchar', length: 20, default: 'PAID' })
  status: string;
}
