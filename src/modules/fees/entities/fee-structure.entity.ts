import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AcademicYear } from '../../academic-years/entities/academic-year.entity';
import { ClassEntity } from '../../classes/entities/class.entity';
import { FeeStructureItem } from './fee-structure-item.entity';

export enum FeeFrequency {
  ONE_TIME = 'ONE_TIME',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  TERM = 'TERM',
  ANNUAL = 'ANNUAL',
}

@Entity('fee_structures')
export class FeeStructure extends BaseEntity {
  @Column({ name: 'academic_year_id', type: 'uuid' })
  academicYearId: string;

  @ManyToOne(() => AcademicYear, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;

  @Column({ name: 'class_id', type: 'uuid', nullable: true })
  classId?: string;

  @ManyToOne(() => ClassEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'class_id' })
  class?: ClassEntity;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({
    type: 'enum',
    enum: FeeFrequency,
    default: FeeFrequency.MONTHLY,
  })
  frequency: FeeFrequency;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @OneToMany(() => FeeStructureItem, (item) => item.feeStructure, { cascade: true })
  items: FeeStructureItem[];
}
