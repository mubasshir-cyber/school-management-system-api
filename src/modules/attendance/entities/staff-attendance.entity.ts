import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { AttendanceStatus } from '../../../common/enums/status.enum';

@Entity('staff_attendance')
export class StaffAttendance extends BaseEntity {
  @Column({ name: 'staff_id', type: 'uuid' })
  staffId: string;

  @ManyToOne(() => Staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @Column({ name: 'attendance_date', type: 'date' })
  attendanceDate: string;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @Column({ name: 'check_in_time', type: 'timestamptz', nullable: true })
  checkInTime?: Date;

  @Column({ name: 'check_out_time', type: 'timestamptz', nullable: true })
  checkOutTime?: Date;

  @Column({ name: 'work_hours', type: 'numeric', precision: 4, scale: 2, default: 0 })
  workHours: number;

  @Column({ name: 'is_late', type: 'boolean', default: false })
  isLate: boolean;

  @Column({ name: 'is_half_day', type: 'boolean', default: false })
  isHalfDay: boolean;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @Column({ name: 'marked_by', type: 'uuid', nullable: true })
  markedBy?: string;
}
