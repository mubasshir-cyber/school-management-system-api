import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AcademicYear } from '../../academic-years/entities/academic-year.entity';
import { ExamType } from './exam-type.entity';
import { GradingScale } from './grading-scale.entity';
import { ExamSchedule } from './exam-schedule.entity';
import { ExamResult } from './exam-result.entity';
import { ExamStatus } from '../exams.enums';

@Entity('exams')
export class Exam extends BaseEntity {
  @Column({ name: 'academic_year_id', type: 'uuid' })
  academicYearId: string;

  @ManyToOne(() => AcademicYear, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;

  @Column({ name: 'exam_type_id', type: 'uuid' })
  examTypeId: string;

  @ManyToOne(() => ExamType, (et) => et.exams, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'exam_type_id' })
  examType: ExamType;

  @Column({ name: 'grading_scale_id', type: 'uuid', nullable: true })
  gradingScaleId?: string;

  @ManyToOne(() => GradingScale, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'grading_scale_id' })
  gradingScale?: GradingScale;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({
    type: 'enum',
    enum: ExamStatus,
    default: ExamStatus.DRAFT,
  })
  status: ExamStatus;

  @OneToMany(() => ExamSchedule, (schedule) => schedule.exam, { cascade: true })
  schedules?: ExamSchedule[];

  @OneToMany(() => ExamResult, (result) => result.exam)
  results?: ExamResult[];
}
