import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  OneToMany,
} from 'typeorm';

@Entity('permissions')
@Unique(['module', 'resource', 'action'])
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'code', type: 'varchar', length: 150, unique: true })
  code: string; // e.g. student.profile.create, fee.payment.collect

  @Column({ name: 'module', type: 'varchar', length: 100 })
  module: string; // student, fee, payroll, attendance, etc.

  @Column({ name: 'resource', type: 'varchar', length: 100 })
  resource: string; // profile, payment, salary, record

  @Column({ name: 'action', type: 'varchar', length: 50 })
  action: string; // create, read, update, delete, approve, pay, publish, export

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_system', type: 'boolean', default: true })
  isSystem: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
