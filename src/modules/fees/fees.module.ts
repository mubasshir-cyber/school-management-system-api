import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeesController } from './fees.controller';
import { FeesService } from './fees.service';
import { FeeType } from './entities/fee-type.entity';
import { FeeStructure } from './entities/fee-structure.entity';
import { FeeStructureItem } from './entities/fee-structure-item.entity';
import { FeeDiscount } from './entities/fee-discount.entity';
import { StudentFeeAssignment } from './entities/student-fee-assignment.entity';
import { FeeInvoice } from './entities/fee-invoice.entity';
import { FeeInvoiceItem } from './entities/fee-invoice-item.entity';
import { FeePayment } from './entities/fee-payment.entity';
import { FeeLedger } from './entities/fee-ledger.entity';
import { Student } from '../students/entities/student.entity';
import { StudentEnrollment } from '../enrollments/entities/student-enrollment.entity';
import { NumberingSequence } from '../students/entities/numbering-sequence.entity';
import { NumberingSequenceService } from '../students/services/numbering-sequence.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FeeType,
      FeeStructure,
      FeeStructureItem,
      FeeDiscount,
      StudentFeeAssignment,
      FeeInvoice,
      FeeInvoiceItem,
      FeePayment,
      FeeLedger,
      Student,
      StudentEnrollment,
      NumberingSequence,
    ]),
    AuditModule,
  ],
  controllers: [FeesController],
  providers: [FeesService, NumberingSequenceService],
  exports: [FeesService],
})
export class FeesModule {}
