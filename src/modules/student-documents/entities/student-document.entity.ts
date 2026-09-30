import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { StudentDocumentType } from '../../../common/enums/status.enum';
import { Student } from '../../students/entities/student.entity';
import { User } from '../../users/entities/user.entity';

@Entity('student_documents')
export class StudentDocument extends BaseEntity {
  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: StudentDocumentType,
  })
  documentType: StudentDocumentType;

  @Column({ name: 'document_name', type: 'varchar', length: 150 })
  documentName: string;

  @Column({ name: 'document_number', type: 'varchar', length: 100, nullable: true })
  documentNumber?: string;

  @Column({ name: 'file_url', type: 'varchar', length: 500 })
  fileUrl: string;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ name: 'file_size', type: 'integer' })
  fileSize: number;

  @Column({ name: 'issue_date', type: 'date', nullable: true })
  issueDate?: string;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: string;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  verifiedBy?: string;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt?: Date;

  @ManyToOne(() => Student, (student) => student.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verified_by' })
  verifier?: User;
}
