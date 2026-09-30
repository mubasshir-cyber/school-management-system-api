import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Department } from './department.entity';
import { Designation } from './designation.entity';
import { StaffDocument } from './staff-document.entity';

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
  VISITING = 'VISITING',
}

export enum StaffStatus {
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  RESIGNED = 'RESIGNED',
  TERMINATED = 'TERMINATED',
  RETIRED = 'RETIRED',
}

@Entity('staff')
export class Staff extends BaseEntity {
  @Column({ name: 'employee_code', type: 'varchar', length: 50 })
  employeeCode: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'department_id', type: 'uuid', nullable: true })
  departmentId?: string;

  @ManyToOne(() => Department, (dept) => dept.staffMembers, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  @Column({ name: 'designation_id', type: 'uuid', nullable: true })
  designationId?: string;

  @ManyToOne(() => Designation, (desig) => desig.staffMembers, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'designation_id' })
  designation?: Designation;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'middle_name', type: 'varchar', length: 100, nullable: true })
  middleName?: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 150 })
  email: string;

  @Column({ type: 'varchar', length: 30 })
  phone: string;

  @Column({ name: 'alternate_phone', type: 'varchar', length: 30, nullable: true })
  alternatePhone?: string;

  @Column({ type: 'varchar', length: 20 })
  gender: string;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: string;

  @Column({ name: 'date_of_joining', type: 'date' })
  dateOfJoining: string;

  @Column({
    name: 'employment_type',
    type: 'enum',
    enum: EmploymentType,
    default: EmploymentType.FULL_TIME,
  })
  employmentType: EmploymentType;

  @Column({ type: 'varchar', length: 200, nullable: true })
  qualification?: string;

  @Column({ name: 'experience_years', type: 'numeric', precision: 4, scale: 1, default: 0 })
  experienceYears: number;

  @Column({ name: 'marital_status', type: 'varchar', length: 30, nullable: true })
  maritalStatus?: string;

  @Column({ name: 'blood_group', type: 'varchar', length: 10, nullable: true })
  bloodGroup?: string;

  @Column({ name: 'emergency_contact_name', type: 'varchar', length: 150, nullable: true })
  emergencyContactName?: string;

  @Column({ name: 'emergency_contact_phone', type: 'varchar', length: 30, nullable: true })
  emergencyContactPhone?: string;

  @Column({ name: 'emergency_contact_relationship', type: 'varchar', length: 50, nullable: true })
  emergencyContactRelationship?: string;

  @Column({ name: 'current_address', type: 'text', nullable: true })
  currentAddress?: string;

  @Column({ name: 'permanent_address', type: 'text', nullable: true })
  permanentAddress?: string;

  @Column({ name: 'bank_account_title', type: 'varchar', length: 150, nullable: true })
  bankAccountTitle?: string;

  @Column({ name: 'bank_name', type: 'varchar', length: 150, nullable: true })
  bankName?: string;

  @Column({ name: 'bank_account_number', type: 'varchar', length: 50, nullable: true })
  bankAccountNumber?: string;

  @Column({ name: 'bank_ifsc_code', type: 'varchar', length: 50, nullable: true })
  bankIfscCode?: string;

  @Column({ name: 'pan_or_tax_id', type: 'varchar', length: 50, nullable: true })
  panOrTaxId?: string;

  @Column({ name: 'aadhaar_or_national_id', type: 'varchar', length: 50, nullable: true })
  aadhaarOrNationalId?: string;

  @Column({ name: 'basic_salary', type: 'numeric', precision: 12, scale: 2, default: 0 })
  basicSalary: number;

  @Column({
    type: 'enum',
    enum: StaffStatus,
    default: StaffStatus.ACTIVE,
  })
  status: StaffStatus;

  @Column({ name: 'photo_url', type: 'text', nullable: true })
  photoUrl?: string;

  @OneToMany(() => StaffDocument, (doc) => doc.staff)
  documents: StaffDocument[];
}
