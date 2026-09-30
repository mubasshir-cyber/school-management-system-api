import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { Student } from '../../students/entities/student.entity';
import { LeaveType } from './leave-type.entity';
import { LeaveStatus } from '../../../common/enums/status.enum';

@Entity('leave_requests')
export class LeaveRequest extends BaseEntity {
  @Column({ name: 'applicant_user_id', type: 'uuid' })
  applicantUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicant_user_id' })
  applicantUser: User;

  @Column({ name: 'staff_id', type: 'uuid', nullable: true })
  staffId?: string;

  @ManyToOne(() => Staff, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'staff_id' })
  staff?: Staff;

  @Column({ name: 'student_id', type: 'uuid', nullable: true })
  studentId?: string;

  @ManyToOne(() => Student, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'student_id' })
  student?: Student;

  @Column({ name: 'leave_type_id', type: 'uuid' })
  leaveTypeId: string;

  @ManyToOne(() => LeaveType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leave_type_id' })
  leaveType: LeaveType;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ name: 'total_days', type: 'numeric', precision: 4, scale: 1, default: 1 })
  totalDays: number;

  @Column({ type: 'text' })
  reason: string;

  @Column({
    type: 'enum',
    enum: LeaveStatus,
    default: LeaveStatus.PENDING,
  })
  status: LeaveStatus;

  @Column({ name: 'document_url', type: 'text', nullable: true })
  documentUrl?: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver?: User;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt?: Date;
}
