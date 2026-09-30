import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Department } from './department.entity';
import { Staff } from './staff.entity';

@Entity('designations')
export class Designation extends BaseEntity {
  @Column({ name: 'department_id', type: 'uuid', nullable: true })
  departmentId?: string;

  @ManyToOne(() => Department, (dept) => dept.designations, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @OneToMany(() => Staff, (staff) => staff.designation)
  staffMembers: Staff[];
}
