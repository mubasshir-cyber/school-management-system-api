import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Exam } from './exam.entity';
import { ClassEntity } from '../../classes/entities/class.entity';
import { Section } from '../../sections/entities/section.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { StudentMark } from './student-mark.entity';
import { ExamScheduleStatus } from '../exams.enums';

@Entity('exam_schedules')
export class ExamSchedule extends BaseEntity {
  @Column({ name: 'exam_id', type: 'uuid' })
  examId: string;

  @ManyToOne(() => Exam, (exam) => exam.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;

  @Column({ name: 'class_id', type: 'uuid' })
  classId: string;

  @ManyToOne(() => ClassEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class: ClassEntity;

  @Column({ name: 'section_id', type: 'uuid', nullable: true })
  sectionId?: string;

  @ManyToOne(() => Section, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'section_id' })
  section?: Section;

  @Column({ name: 'subject_id', type: 'uuid' })
  subjectId: string;

  @ManyToOne(() => Subject, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @Column({ name: 'exam_date', type: 'date' })
  examDate: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'room_number', type: 'varchar', length: 50, nullable: true })
  roomNumber?: string;

  @Column({ name: 'max_marks', type: 'numeric', precision: 6, scale: 2, default: 100.0 })
  maxMarks: number;

  @Column({ name: 'pass_marks', type: 'numeric', precision: 6, scale: 2, default: 35.0 })
  passMarks: number;

  @Column({ name: 'theory_max_marks', type: 'numeric', precision: 6, scale: 2, default: 80.0 })
  theoryMaxMarks: number;

  @Column({ name: 'practical_max_marks', type: 'numeric', precision: 6, scale: 2, default: 20.0 })
  practicalMaxMarks: number;

  @Column({ name: 'invigilator_staff_id', type: 'uuid', nullable: true })
  invigilatorStaffId?: string;

  @ManyToOne(() => Staff, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'invigilator_staff_id' })
  invigilatorStaff?: Staff;

  @Column({
    type: 'enum',
    enum: ExamScheduleStatus,
    default: ExamScheduleStatus.SCHEDULED,
  })
  status: ExamScheduleStatus;

  @OneToMany(() => StudentMark, (mark) => mark.examSchedule, { cascade: true })
  marks?: StudentMark[];
}
