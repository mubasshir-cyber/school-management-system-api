import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  @Index()
  tenantId?: string;

  @Column({ name: 'school_id', type: 'uuid', nullable: true })
  @Index()
  schoolId?: string;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId?: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  @Index()
  userId?: string;

  @Column({ name: 'user_email', type: 'varchar', length: 255, nullable: true })
  userEmail?: string;

  @Column({ name: 'action', type: 'varchar', length: 50 }) // CREATE, UPDATE, DELETE, LOGIN, EXPORT, APPROVE
  @Index()
  action: string;

  @Column({ name: 'module', type: 'varchar', length: 100 }) // student, fee, payroll, rbac, auth
  @Index()
  module: string;

  @Column({ name: 'entity', type: 'varchar', length: 100 }) // Student, Payment, Role, User
  entity: string;

  @Column({ name: 'entity_id', type: 'varchar', length: 100, nullable: true })
  entityId?: string;

  @Column({ name: 'old_value', type: 'jsonb', nullable: true })
  oldValue?: any;

  @Column({ name: 'new_value', type: 'jsonb', nullable: true })
  newValue?: any;

  @Column({ name: 'ip_address', type: 'varchar', length: 50, nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  userAgent?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @Index()
  createdAt: Date;
}
