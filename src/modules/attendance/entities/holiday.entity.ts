import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AcademicYear } from '../../academic-years/entities/academic-year.entity';
import { HolidayType } from '../../../common/enums/status.enum';

@Entity('holidays')
export class Holiday extends BaseEntity {
  @Column({ name: 'academic_year_id', type: 'uuid', nullable: true })
  academicYearId?: string;

  @ManyToOne(() => AcademicYear, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear?: AcademicYear;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({
    name: 'holiday_type',
    type: 'enum',
    enum: HolidayType,
    default: HolidayType.NATIONAL,
  })
  holidayType: HolidayType;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ name: 'total_days', type: 'int', default: 1 })
  totalDays: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_recurring', type: 'boolean', default: false })
  isRecurring: boolean;
}
