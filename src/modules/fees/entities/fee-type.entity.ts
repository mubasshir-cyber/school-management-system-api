import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { FeeStructureItem } from './fee-structure-item.entity';

@Entity('fee_types')
export class FeeType extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_optional', type: 'boolean', default: false })
  isOptional: boolean;

  @Column({ name: 'account_code', type: 'varchar', length: 50, nullable: true })
  accountCode?: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @OneToMany(() => FeeStructureItem, (item) => item.feeType)
  structureItems?: FeeStructureItem[];
}
