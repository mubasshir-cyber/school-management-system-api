import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GuardianRelationshipType } from '../../../common/enums/status.enum';
import { Student } from '../../students/entities/student.entity';
import { Guardian } from './guardian.entity';

@Entity('student_guardians')
export class StudentGuardian {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'branch_id', type: 'uuid' })
  branchId: string;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({ name: 'guardian_id', type: 'uuid' })
  guardianId: string;

  @Column({
    name: 'relationship_type',
    type: 'enum',
    enum: GuardianRelationshipType,
  })
  relationshipType: GuardianRelationshipType;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ name: 'is_emergency_contact', type: 'boolean', default: false })
  isEmergencyContact: boolean;

  @Column({ name: 'can_pickup_student', type: 'boolean', default: false })
  canPickupStudent: boolean;

  @Column({ name: 'receives_notifications', type: 'boolean', default: true })
  receivesNotifications: boolean;

  @Column({ name: 'has_portal_access', type: 'boolean', default: false })
  hasPortalAccess: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Student, (student) => student.guardians, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Guardian, (guardian) => guardian.students, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guardian_id' })
  guardian: Guardian;
}
