import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { SalaryStructure } from './salary-structure.entity';

@Entity('staff_salary_assignments')
export class StaffSalaryAssignment extends BaseEntity {
  @Column({ name: 'staff_id', type: 'uuid' })
  staffId: string;

  @ManyToOne(() => Staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @Column({ name: 'salary_structure_id', type: 'uuid' })
  salaryStructureId: string;

  @ManyToOne(() => SalaryStructure, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'salary_structure_id' })
  salaryStructure: SalaryStructure;

  @Column({ name: 'base_gross_salary', type: 'numeric', precision: 12, scale: 2, default: 0 })
  baseGrossSalary: number;

  @Column({ name: 'bank_name', type: 'varchar', length: 150, nullable: true })
  bankName?: string;

  @Column({ name: 'bank_account_number', type: 'varchar', length: 50, nullable: true })
  bankAccountNumber?: string;

  @Column({ name: 'ifsc_code', type: 'varchar', length: 50, nullable: true })
  ifscCode?: string;

  @Column({ name: 'pan_number', type: 'varchar', length: 50, nullable: true })
  panNumber?: string;

  @Column({ name: 'effective_from', type: 'date' })
  effectiveFrom: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;
}
