import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { StudentStatus } from '../../../common/enums/status.enum';
import { StudentGuardian } from '../../guardians/entities/student-guardian.entity';
import { StudentEnrollment } from '../../enrollments/entities/student-enrollment.entity';
import { StudentDocument } from '../../student-documents/entities/student-document.entity';
import { Admission } from '../../admissions/entities/admission.entity';

@Entity('students')
export class Student extends BaseEntity {
  @Column({ name: 'student_code', type: 'varchar', length: 50 })
  studentCode: string;

  @Column({ name: 'admission_number', type: 'varchar', length: 50, nullable: true })
  admissionNumber?: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'middle_name', type: 'varchar', length: 100, nullable: true })
  middleName?: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: string;

  @Column({ name: 'gender', type: 'varchar', length: 20 })
  gender: string;

  @Column({ name: 'blood_group', type: 'varchar', length: 10, nullable: true })
  bloodGroup?: string;

  @Column({ name: 'nationality', type: 'varchar', length: 50, default: 'Indian' })
  nationality: string;

  @Column({ name: 'category', type: 'varchar', length: 50, default: 'General' })
  category: string;

  @Column({ name: 'government_id_type', type: 'varchar', length: 50, nullable: true })
  governmentIdType?: string;

  @Column({ name: 'government_id_number', type: 'varchar', length: 50, nullable: true })
  governmentIdNumber?: string;

  @Column({ name: 'mobile', type: 'varchar', length: 20, nullable: true })
  mobile?: string;

  @Column({ name: 'email', type: 'varchar', length: 150, nullable: true })
  email?: string;

  @Column({ name: 'address_line_1', type: 'varchar', length: 255, nullable: true })
  addressLine1?: string;

  @Column({ name: 'address_line_2', type: 'varchar', length: 255, nullable: true })
  addressLine2?: string;

  @Column({ name: 'city', type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ name: 'state', type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ name: 'country', type: 'varchar', length: 100, default: 'India' })
  country: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postalCode?: string;

  @Column({ name: 'photo_url', type: 'varchar', length: 500, nullable: true })
  photoUrl?: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: StudentStatus,
    default: StudentStatus.REGISTERED,
  })
  status: StudentStatus;

  @OneToMany(() => StudentGuardian, (sg) => sg.student)
  guardians?: StudentGuardian[];

  @OneToMany(() => StudentEnrollment, (se) => se.student)
  enrollments?: StudentEnrollment[];

  @OneToMany(() => StudentDocument, (sd) => sd.student)
  documents?: StudentDocument[];

  @OneToMany(() => Admission, (adm) => adm.student)
  admissions?: Admission[];
}
