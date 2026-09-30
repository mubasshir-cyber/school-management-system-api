import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Staff } from './staff.entity';

export enum StaffDocumentType {
  RESUME = 'RESUME',
  CONTRACT = 'CONTRACT',
  IDENTITY_PROOF = 'IDENTITY_PROOF',
  DEGREE_CERTIFICATE = 'DEGREE_CERTIFICATE',
  EXPERIENCE_LETTER = 'EXPERIENCE_LETTER',
  BACKGROUND_CHECK = 'BACKGROUND_CHECK',
  OTHER = 'OTHER',
}

@Entity('staff_documents')
export class StaffDocument extends BaseEntity {
  @Column({ name: 'staff_id', type: 'uuid' })
  staffId: string;

  @ManyToOne(() => Staff, (staff) => staff.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: StaffDocumentType,
    default: StaffDocumentType.OTHER,
  })
  documentType: StaffDocumentType;

  @Column({ name: 'document_name', type: 'varchar', length: 200 })
  documentName: string;

  @Column({ name: 'document_number', type: 'varchar', length: 100, nullable: true })
  documentNumber?: string;

  @Column({ name: 'file_url', type: 'text' })
  fileUrl: string;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ name: 'file_size', type: 'int', default: 0 })
  fileSize: number;

  @Column({ name: 'issue_date', type: 'date', nullable: true })
  issueDate?: string;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: string;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt?: Date;

  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  verifiedBy?: string;
}
