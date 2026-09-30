import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SequenceType } from '../../../common/enums/status.enum';

@Entity('numbering_sequences')
export class NumberingSequence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({
    name: 'sequence_type',
    type: 'enum',
    enum: SequenceType,
  })
  sequenceType: SequenceType;

  @Column({ name: 'prefix', type: 'varchar', length: 20, default: '' })
  prefix: string;

  @Column({ name: 'current_year', type: 'integer' })
  currentYear: number;

  @Column({ name: 'last_number', type: 'integer', default: 0 })
  lastNumber: number;

  @Column({
    name: 'format',
    type: 'varchar',
    length: 50,
    default: '{PREFIX}-{YEAR}-{SEQ:6}',
  })
  format: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
