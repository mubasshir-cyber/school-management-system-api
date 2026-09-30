import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { FeeInvoice } from './fee-invoice.entity';
import { FeeType } from './fee-type.entity';

@Entity('fee_invoice_items')
export class FeeInvoiceItem extends BaseEntity {
  @Column({ name: 'fee_invoice_id', type: 'uuid' })
  feeInvoiceId: string;

  @ManyToOne(() => FeeInvoice, (fi) => fi.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fee_invoice_id' })
  feeInvoice: FeeInvoice;

  @Column({ name: 'fee_type_id', type: 'uuid' })
  feeTypeId: string;

  @ManyToOne(() => FeeType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'fee_type_id' })
  feeType: FeeType;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  amount: number;

  @Column({ name: 'discount_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'net_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  netAmount: number;
}
