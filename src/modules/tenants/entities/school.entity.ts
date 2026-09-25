import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { CommonStatus } from '../../../common/enums/status.enum';

@Entity('schools')
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'code', type: 'varchar', length: 50 })
  code: string;

  @Column({ name: 'registration_number', type: 'varchar', length: 100, nullable: true })
  registrationNumber?: string;

  @Column({ name: 'board', type: 'varchar', length: 100, nullable: true })
  board?: string; // CBSE, ICSE, State Board, IB, Cambridge

  @Column({ name: 'medium', type: 'varchar', length: 100, default: 'English' })
  medium: string;

  @Column({ name: 'school_type', type: 'varchar', length: 100, default: 'Co-Educational' })
  schoolType: string; // Day School, Boarding, etc.

  @Column({ name: 'address', type: 'text', nullable: true })
  address?: string;

  @Column({ name: 'city', type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ name: 'state', type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ name: 'country', type: 'varchar', length: 100, default: 'India' })
  country: string;

  @Column({ name: 'pincode', type: 'varchar', length: 20, nullable: true })
  pincode?: string;

  @Column({ name: 'phone', type: 'varchar', length: 50, nullable: true })
  phone?: string;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ name: 'website', type: 'varchar', length: 255, nullable: true })
  website?: string;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl?: string;

  @Column({ name: 'principal_name', type: 'varchar', length: 255, nullable: true })
  principalName?: string;

  @Column({ name: 'established_date', type: 'date', nullable: true })
  establishedDate?: Date;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CommonStatus,
    default: CommonStatus.ACTIVE,
  })
  status: CommonStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
