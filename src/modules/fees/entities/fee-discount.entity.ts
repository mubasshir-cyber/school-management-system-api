import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('fee_discounts')
export class FeeDiscount extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ name: 'discount_type', type: 'varchar', length: 20, default: 'PERCENTAGE' })
  discountType: 'PERCENTAGE' | 'FIXED';

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  value: number;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;
}
