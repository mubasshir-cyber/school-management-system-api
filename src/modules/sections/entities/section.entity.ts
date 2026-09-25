import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { School } from '../../tenants/entities/school.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { AcademicYear } from '../../academic-years/entities/academic-year.entity';
import { ClassEntity } from '../../classes/entities/class.entity';
import { User } from '../../users/entities/user.entity';
import { CommonStatus } from '../../../common/enums/status.enum';

@Entity('sections')
@Unique(['classId', 'code'])
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'branch_id', type: 'uuid', nullable: true })
  branchId?: string;

  @Column({ name: 'academic_year_id', type: 'uuid' })
  academicYearId: string;

  @ManyToOne(() => AcademicYear, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;

  @Column({ name: 'class_id', type: 'uuid' })
  classId: string;

  @ManyToOne(() => ClassEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class: ClassEntity;

  @Column({ name: 'name', type: 'varchar', length: 50 })
  name: string; // e.g. A, B, Rose, Alpha

  @Column({ name: 'code', type: 'varchar', length: 50 })
  code: string; // e.g. SEC-A

  @Column({ name: 'capacity', type: 'int', default: 40 })
  capacity: number;

  @Column({ name: 'room_number', type: 'varchar', length: 50, nullable: true })
  roomNumber?: string;

  @Column({ name: 'class_teacher_id', type: 'uuid', nullable: true })
  classTeacherId?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'class_teacher_id' })
  classTeacher?: User;

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
