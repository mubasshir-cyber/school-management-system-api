import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { NumberingSequence } from '../entities/numbering-sequence.entity';
import { SequenceType } from '../../../common/enums/status.enum';

@Injectable()
export class NumberingSequenceService {
  private readonly logger = new Logger(NumberingSequenceService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Generates next sequence number with row-level transaction locking to guarantee zero collisions.
   */
  async getNextSequence(
    tenantId: string,
    schoolId: string,
    sequenceType: SequenceType,
    prefixOverride?: string,
    manager?: EntityManager,
  ): Promise<string> {
    const currentYear = new Date().getFullYear();
    const defaultPrefix = prefixOverride || this.getDefaultPrefix(sequenceType);

    const execute = async (em: EntityManager): Promise<string> => {
      // Find or create sequence entry with lock
      let seq = await em
        .createQueryBuilder(NumberingSequence, 'seq')
        .setLock('pessimistic_write')
        .where('seq.schoolId = :schoolId', { schoolId })
        .andWhere('seq.sequenceType = :sequenceType', { sequenceType })
        .andWhere('seq.currentYear = :currentYear', { currentYear })
        .getOne();

      if (!seq) {
        seq = em.create(NumberingSequence, {
          tenantId,
          schoolId,
          sequenceType,
          prefix: defaultPrefix,
          currentYear,
          lastNumber: 0,
          format: '{PREFIX}-{YEAR}-{SEQ:6}',
        });
      }

      seq.lastNumber += 1;
      await em.save(NumberingSequence, seq);

      const seqPadded = String(seq.lastNumber).padStart(6, '0');
      return `${seq.prefix}-${currentYear}-${seqPadded}`;
    };

    if (manager) {
      return execute(manager);
    } else {
      return this.dataSource.transaction(async (em) => execute(em));
    }
  }

  private getDefaultPrefix(type: SequenceType): string {
    switch (type) {
      case SequenceType.STUDENT:
        return 'STU';
      case SequenceType.ADMISSION:
        return 'ADM';
      case SequenceType.EMPLOYEE:
        return 'EMP';
      case SequenceType.RECEIPT:
        return 'REC';
      case SequenceType.EXPENSE:
        return 'EXP';
      default:
        return 'DOC';
    }
  }
}
