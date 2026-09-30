import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreasuryController } from './treasury.controller';
import { TreasuryService } from './treasury.service';
import { TreasuryAccount } from './entities/treasury-account.entity';
import { IncomeCategory } from './entities/income-category.entity';
import { IncomeTransaction } from './entities/income-transaction.entity';
import { ExpenseCategory } from './entities/expense-category.entity';
import { Expense } from './entities/expense.entity';
import { FeePayment } from '../fees/entities/fee-payment.entity';
import { Payroll } from '../payroll/entities/payroll.entity';
import { NumberingSequence } from '../students/entities/numbering-sequence.entity';
import { NumberingSequenceService } from '../students/services/numbering-sequence.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TreasuryAccount,
      IncomeCategory,
      IncomeTransaction,
      ExpenseCategory,
      Expense,
      FeePayment,
      Payroll,
      NumberingSequence,
    ]),
    AuditModule,
  ],
  controllers: [TreasuryController],
  providers: [TreasuryService, NumberingSequenceService],
  exports: [TreasuryService],
})
export class TreasuryModule {}
