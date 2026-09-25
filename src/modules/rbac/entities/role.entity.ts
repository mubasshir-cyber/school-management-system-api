import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { DataScope } from '../../../common/enums/scope.enum';
import { CommonStatus } from '../../../common/enums/status.enum';
import { RolePermission } from './role-permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId?: string;

  @Column({ name: 'school_id', type: 'uuid', nullable: true })
  schoolId?: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string; // e.g. Principal, Accountant, Class Teacher

  @Column({ name: 'code', type: 'varchar', length: 100 })
  code: string; // e.g. PRINCIPAL, ACCOUNTANT, CLASS_TEACHER

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({
    name: 'default_scope',
    type: 'enum',
    enum: DataScope,
    default: DataScope.ORGANIZATION,
  })
  defaultScope: DataScope;

  @Column({ name: 'is_system', type: 'boolean', default: false })
  isSystem: boolean;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CommonStatus,
    default: CommonStatus.ACTIVE,
  })
  status: CommonStatus;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
