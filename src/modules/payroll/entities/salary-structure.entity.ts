import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SalaryStructureItem } from './salary-structure-item.entity';

@Entity('salary_structures')
export class SalaryStructure extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @OneToMany(() => SalaryStructureItem, (item) => item.salaryStructure, { cascade: true })
  items: SalaryStructureItem[];
}
