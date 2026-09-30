import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SalaryStructure } from './salary-structure.entity';
import { SalaryComponent } from './salary-component.entity';
import { SalaryCalculationType } from '../payroll.enums';

@Entity('salary_structure_items')
export class SalaryStructureItem extends BaseEntity {
  @Column({ name: 'salary_structure_id', type: 'uuid' })
  salaryStructureId: string;

  @ManyToOne(() => SalaryStructure, (ss) => ss.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'salary_structure_id' })
  salaryStructure: SalaryStructure;

  @Column({ name: 'salary_component_id', type: 'uuid' })
  salaryComponentId: string;

  @ManyToOne(() => SalaryComponent, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'salary_component_id' })
  salaryComponent: SalaryComponent;

  @Column({
    name: 'calculation_type',
    type: 'enum',
    enum: SalaryCalculationType,
    default: SalaryCalculationType.FIXED,
  })
  calculationType: SalaryCalculationType;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  value: number;
}
