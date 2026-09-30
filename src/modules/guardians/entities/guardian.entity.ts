import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CommonStatus, GuardianRelationshipType } from '../../../common/enums/status.enum';
import { StudentGuardian } from './student-guardian.entity';

@Entity('guardians')
export class Guardian extends BaseEntity {
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'middle_name', type: 'varchar', length: 100, nullable: true })
  middleName?: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({
    name: 'relationship_type',
    type: 'enum',
    enum: GuardianRelationshipType,
    default: GuardianRelationshipType.FATHER,
  })
  relationshipType: GuardianRelationshipType;

  @Column({ name: 'mobile', type: 'varchar', length: 20 })
  mobile: string;

  @Column({ name: 'alternate_mobile', type: 'varchar', length: 20, nullable: true })
  alternateMobile?: string;

  @Column({ name: 'email', type: 'varchar', length: 150, nullable: true })
  email?: string;

  @Column({ name: 'occupation', type: 'varchar', length: 100, nullable: true })
  occupation?: string;

  @Column({ name: 'employer', type: 'varchar', length: 150, nullable: true })
  employer?: string;

  @Column({ name: 'annual_income', type: 'numeric', precision: 12, scale: 2, nullable: true })
  annualIncome?: number;

  @Column({ name: 'government_id_type', type: 'varchar', length: 50, nullable: true })
  governmentIdType?: string;

  @Column({ name: 'government_id_number', type: 'varchar', length: 50, nullable: true })
  governmentIdNumber?: string;

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
    enum: CommonStatus,
    default: CommonStatus.ACTIVE,
  })
  status: CommonStatus;

  @OneToMany(() => StudentGuardian, (sg) => sg.guardian)
  students?: StudentGuardian[];
}
