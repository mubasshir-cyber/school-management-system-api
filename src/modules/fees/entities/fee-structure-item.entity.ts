import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { FeeStructure } from './fee-structure.entity';
import { FeeType } from './fee-type.entity';

@Entity('fee_structure_items')
export class FeeStructureItem extends BaseEntity {
  @Column({ name: 'fee_structure_id', type: 'uuid' })
  feeStructureId: string;

  @ManyToOne(() => FeeStructure, (fs) => fs.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fee_structure_id' })
  feeStructure: FeeStructure;

  @Column({ name: 'fee_type_id', type: 'uuid' })
  feeTypeId: string;

  @ManyToOne(() => FeeType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'fee_type_id' })
  feeType: FeeType;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  amount: number;

  @Column({ name: 'due_day_of_month', type: 'int', default: 10 })
  dueDayOfMonth: number;

  @Column({ name: 'late_fine_amount', type: 'numeric', precision: 10, scale: 2, default: 0 })
  lateFineAmount: number;

  @Column({ name: 'grace_days', type: 'int', default: 5 })
  graceDays: number;
}
