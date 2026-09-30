import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { IncomeTransaction } from './income-transaction.entity';

@Entity('income_categories')
export class IncomeCategory extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @OneToMany(() => IncomeTransaction, (it) => it.incomeCategory)
  transactions?: IncomeTransaction[];
}
