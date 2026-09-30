import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Designation } from './designation.entity';
import { Staff } from './staff.entity';

@Entity('departments')
export class Department extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'head_of_department_id', type: 'uuid', nullable: true })
  headOfDepartmentId?: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @OneToMany(() => Designation, (designation) => designation.department)
  designations: Designation[];

  @OneToMany(() => Staff, (staff) => staff.department)
  staffMembers: Staff[];
}
