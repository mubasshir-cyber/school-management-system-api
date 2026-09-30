import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { GradingScaleType } from '../exams.enums';

export interface GradeRange {
  grade: string;
  minScore: number;
  maxScore: number;
  gpaPoint?: number;
  remarks?: string;
}

@Entity('grading_scales')
export class GradingScale extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({
    name: 'scale_type',
    type: 'enum',
    enum: GradingScaleType,
    default: GradingScaleType.PERCENTAGE,
  })
  scaleType: GradingScaleType;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'jsonb', default: [] })
  ranges: GradeRange[];

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;
}
