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
import { SubjectType } from '../../../common/enums/subject-type.enum';
import { CommonStatus } from '../../../common/enums/status.enum';

@Entity('subjects')
@Unique(['schoolId', 'code'])
export class Subject {
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

  @Column({ name: 'name', type: 'varchar', length: 150 })
  name: string; // e.g. Mathematics, Computer Science, Biology

  @Column({ name: 'code', type: 'varchar', length: 50 })
  code: string; // e.g. MATH-101, CS-201

  @Column({
    name: 'type',
    type: 'enum',
    enum: SubjectType,
    default: SubjectType.CORE,
  })
  type: SubjectType;

  @Column({
    name: 'theory_max_marks',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 100,
  })
  theoryMaxMarks: number;

  @Column({
    name: 'practical_max_marks',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
  })
  practicalMaxMarks: number;

  @Column({
    name: 'passing_marks',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 35,
  })
  passingMarks: number;

  @Column({ name: 'is_grade_based', type: 'boolean', default: false })
  isGradeBased: boolean;

  @Column({
    name: 'credit',
    type: 'numeric',
    precision: 4,
    scale: 2,
    default: 1.0,
  })
  credit: number;

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
