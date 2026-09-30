import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { LeaveCategory } from '../../../common/enums/status.enum';

@Entity('leave_types')
export class LeaveType extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({
    type: 'enum',
    enum: LeaveCategory,
    default: LeaveCategory.CASUAL,
  })
  category: LeaveCategory;

  @Column({ name: 'days_allowed_per_year', type: 'int', default: 12 })
  daysAllowedPerYear: number;

  @Column({ name: 'is_paid', type: 'boolean', default: true })
  isPaid: boolean;

  @Column({ name: 'is_carry_forward', type: 'boolean', default: false })
  isCarryForward: boolean;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;
}
