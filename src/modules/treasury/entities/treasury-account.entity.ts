import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Expense } from './expense.entity';
import { IncomeTransaction } from './income-transaction.entity';

export enum TreasuryAccountType {
  BANK = 'BANK',
  CASH = 'CASH',
  PETTY_CASH = 'PETTY_CASH',
  ONLINE_WALLET = 'ONLINE_WALLET',
}

@Entity('treasury_accounts')
export class TreasuryAccount extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  accountName: string;

  @Column({
    name: 'account_type',
    type: 'enum',
    enum: TreasuryAccountType,
    default: TreasuryAccountType.BANK,
  })
  accountType: TreasuryAccountType;

  @Column({ name: 'account_number', type: 'varchar', length: 50, nullable: true })
  accountNumber?: string;

  @Column({ name: 'bank_name', type: 'varchar', length: 150, nullable: true })
  bankName?: string;

  @Column({ name: 'branch_name', type: 'varchar', length: 150, nullable: true })
  branchName?: string;

  @Column({ name: 'ifsc_code', type: 'varchar', length: 50, nullable: true })
  ifscCode?: string;

  @Column({ name: 'opening_balance', type: 'numeric', precision: 14, scale: 2, default: 0 })
  openingBalance: number;

  @Column({ name: 'current_balance', type: 'numeric', precision: 14, scale: 2, default: 0 })
  currentBalance: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' })
  status: string;

  @OneToMany(() => IncomeTransaction, (it) => it.treasuryAccount)
  incomes?: IncomeTransaction[];

  @OneToMany(() => Expense, (e) => e.treasuryAccount)
  expenses?: Expense[];
}
