import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SalaryStructureItem } from './salary-structure-item.entity';

import { SalaryComponentType, SalaryCalculationType } from '../payroll.enums';
export { SalaryComponentType, SalaryCalculationType };

@Entity('salary_components')
export class SalaryComponent extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({
    name: 'component_type',
    type: 'enum',
    enum: SalaryComponentType,
    default: SalaryComponentType.EARNING,
  })
  componentType: SalaryComponentType;

  @Column({
    name: 'calculation_type',
    type: 'enum',
    enum: SalaryCalculationType,
    default: SalaryCalculationType.FIXED,
  })
  calculationType: SalaryCalculationType;

  @Column({ name: 'default_value', type: 'numeric', precision: 12, scale: 2, default: 0 })
  defaultValue: number;

  @Column({ name: 'is_taxable', type: 'boolean', default: true })
  isTaxable: boolean;

  @Column({ name: 'is_statutory', type: 'boolean', default: false })
  isStatutory: boolean;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @OneToMany(() => SalaryStructureItem, (item) => item.salaryComponent)
  structureItems?: SalaryStructureItem[];
}
