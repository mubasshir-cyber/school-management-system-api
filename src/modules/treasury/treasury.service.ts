import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TreasuryAccount } from './entities/treasury-account.entity';
import { IncomeCategory } from './entities/income-category.entity';
import { IncomeTransaction } from './entities/income-transaction.entity';
import { ExpenseCategory } from './entities/expense-category.entity';
import { Expense, ExpenseStatus } from './entities/expense.entity';
import { FeePayment, FeePaymentStatus } from '../fees/entities/fee-payment.entity';
import { Payroll, PayrollStatus } from '../payroll/entities/payroll.entity';
import { NumberingSequenceService } from '../students/services/numbering-sequence.service';
import { AuditService } from '../audit/audit.service';
import { SequenceType } from '../../common/enums/status.enum';
import { CreateTreasuryAccountDto, UpdateTreasuryAccountDto } from './dto/create-treasury-account.dto';
import { CreateIncomeCategoryDto } from './dto/create-income-category.dto';
import { RecordIncomeDto } from './dto/record-income.dto';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { CreateExpenseDto, ReviewExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class TreasuryService {
  constructor(
    @InjectRepository(TreasuryAccount)
    private readonly accountRepo: Repository<TreasuryAccount>,
    @InjectRepository(IncomeCategory)
    private readonly incomeCategoryRepo: Repository<IncomeCategory>,
    @InjectRepository(IncomeTransaction)
    private readonly incomeRepo: Repository<IncomeTransaction>,
    @InjectRepository(ExpenseCategory)
    private readonly expenseCategoryRepo: Repository<ExpenseCategory>,
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    @InjectRepository(FeePayment)
    private readonly feePaymentRepo: Repository<FeePayment>,
    @InjectRepository(Payroll)
    private readonly payrollRepo: Repository<Payroll>,
    private readonly numberingSequenceService: NumberingSequenceService,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  // ==========================================
  // 1. TREASURY ACCOUNTS
  // ==========================================
  async getAccounts(tenantId: string, schoolId: string): Promise<TreasuryAccount[]> {
    return this.accountRepo.find({
      where: { schoolId, deletedAt: null as any },
      order: { accountType: 'ASC', accountName: 'ASC' },
    });
  }

  async createAccount(
    tenantId: string,
    schoolId: string,
    userId: string,
    dto: CreateTreasuryAccountDto,
  ): Promise<TreasuryAccount> {
    const account = this.accountRepo.create({
      ...dto,
      currentBalance: dto.openingBalance ?? 0,
      tenantId,
      schoolId,
      createdBy: userId,
    });

    const saved = await this.accountRepo.save(account);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId,
      action: 'CREATE',
      module: 'TREASURY',
      entity: 'TreasuryAccount',
      entityId: saved.id,
      newValue: saved,
    });

    return saved;
  }

  // ==========================================
  // 2. NON-FEE INCOME CATEGORIES & TRANSACTIONS
  // ==========================================
  async getIncomeCategories(tenantId: string, schoolId: string): Promise<IncomeCategory[]> {
    return this.incomeCategoryRepo.find({
      where: { schoolId, deletedAt: null as any },
      order: { name: 'ASC' },
    });
  }

  async createIncomeCategory(
    tenantId: string,
    schoolId: string,
    userId: string,
    dto: CreateIncomeCategoryDto,
  ): Promise<IncomeCategory> {
    const existing = await this.incomeCategoryRepo.findOne({
      where: { schoolId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Income category code '${dto.code}' already exists`);
    }

    const cat = this.incomeCategoryRepo.create({
      ...dto,
      tenantId,
      schoolId,
      createdBy: userId,
    });

    return this.incomeCategoryRepo.save(cat);
  }

  async getIncomes(
    tenantId: string,
    schoolId: string,
    params?: {
      incomeCategoryId?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.incomeRepo
      .createQueryBuilder('inc')
      .leftJoinAndSelect('inc.incomeCategory', 'cat')
      .leftJoinAndSelect('inc.treasuryAccount', 'acc')
      .leftJoinAndSelect('inc.receivedBy', 'usr')
      .where('inc.school_id = :schoolId', { schoolId })
      .andWhere('inc.deleted_at IS NULL');

    if (params?.incomeCategoryId) {
      query.andWhere('inc.income_category_id = :incomeCategoryId', {
        incomeCategoryId: params.incomeCategoryId,
      });
    }

    const [items, total] = await query
      .orderBy('inc.transaction_date', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async recordIncome(
    tenantId: string,
    schoolId: string,
    userId: string,
    dto: RecordIncomeDto,
  ): Promise<IncomeTransaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const receiptNumber = `INC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

      const income = this.incomeRepo.create({
        ...dto,
        receiptNumber,
        receivedById: userId,
        tenantId,
        schoolId,
        createdBy: userId,
      });

      const saved = await queryRunner.manager.save(IncomeTransaction, income);

      if (dto.treasuryAccountId) {
        const account = await queryRunner.manager.findOne(TreasuryAccount, {
          where: { id: dto.treasuryAccountId },
        });
        if (account) {
          account.currentBalance = Number(account.currentBalance) + Number(dto.amount);
          account.updatedBy = userId;
          await queryRunner.manager.save(TreasuryAccount, account);
        }
      }

      await queryRunner.commitTransaction();

      await this.auditService.log({
        tenantId,
        schoolId,
        userId,
        action: 'CREATE',
        module: 'TREASURY',
        entity: 'IncomeTransaction',
        entityId: saved.id,
        newValue: saved,
      });

      return this.incomeRepo.findOneOrFail({
        where: { id: saved.id },
        relations: { incomeCategory: true, treasuryAccount: true },
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ==========================================
  // 3. EXPENSE CATEGORIES & EXPENSES
  // ==========================================
  async getExpenseCategories(tenantId: string, schoolId: string): Promise<ExpenseCategory[]> {
    return this.expenseCategoryRepo.find({
      where: { schoolId, deletedAt: null as any },
      order: { name: 'ASC' },
    });
  }

  async createExpenseCategory(
    tenantId: string,
    schoolId: string,
    userId: string,
    dto: CreateExpenseCategoryDto,
  ): Promise<ExpenseCategory> {
    const existing = await this.expenseCategoryRepo.findOne({
      where: { schoolId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Expense category code '${dto.code}' already exists`);
    }

    const cat = this.expenseCategoryRepo.create({
      ...dto,
      tenantId,
      schoolId,
      createdBy: userId,
    });

    return this.expenseCategoryRepo.save(cat);
  }

  async getExpenses(
    tenantId: string,
    schoolId: string,
    params?: {
      expenseCategoryId?: string;
      status?: ExpenseStatus;
      page?: number;
      limit?: number;
    },
  ) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.expenseRepo
      .createQueryBuilder('exp')
      .leftJoinAndSelect('exp.expenseCategory', 'cat')
      .leftJoinAndSelect('exp.treasuryAccount', 'acc')
      .leftJoinAndSelect('exp.requestedBy', 'req')
      .leftJoinAndSelect('exp.approvedBy', 'app')
      .where('exp.school_id = :schoolId', { schoolId })
      .andWhere('exp.deleted_at IS NULL');

    if (params?.expenseCategoryId) {
      query.andWhere('exp.expense_category_id = :expenseCategoryId', {
        expenseCategoryId: params.expenseCategoryId,
      });
    }
    if (params?.status) {
      query.andWhere('exp.status = :status', { status: params.status });
    }

    const [items, total] = await query
      .orderBy('exp.expense_date', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getExpenseById(tenantId: string, schoolId: string, id: string): Promise<Expense> {
    const expense = await this.expenseRepo.findOne({
      where: { id, schoolId, deletedAt: null as any },
      relations: {
        expenseCategory: true,
        treasuryAccount: true,
        requestedBy: true,
        approvedBy: true,
      },
    });
    if (!expense) {
      throw new NotFoundException('Expense voucher not found');
    }
    return expense;
  }

  async createExpense(
    tenantId: string,
    schoolId: string,
    userId: string,
    dto: CreateExpenseDto,
  ): Promise<Expense> {
    const voucherNumber = `VOU-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    const expense = this.expenseRepo.create({
      ...dto,
      voucherNumber,
      status: ExpenseStatus.PENDING,
      requestedById: userId,
      tenantId,
      schoolId,
      createdBy: userId,
    });

    const saved = await this.expenseRepo.save(expense);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId,
      action: 'CREATE',
      module: 'TREASURY',
      entity: 'Expense',
      entityId: saved.id,
      newValue: saved,
    });

    return this.getExpenseById(tenantId, schoolId, saved.id);
  }

  async reviewExpense(
    tenantId: string,
    schoolId: string,
    userId: string,
    id: string,
    dto: ReviewExpenseDto,
  ): Promise<Expense> {
    const expense = await this.getExpenseById(tenantId, schoolId, id);
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (dto.status === 'APPROVED') {
      expense.status = ExpenseStatus.APPROVED;
      expense.approvedById = userId;
      expense.approvedAt = new Date();
    } else {
      expense.status = ExpenseStatus.REJECTED;
      expense.rejectionReason = dto.rejectionReason;
    }

    expense.updatedBy = userId;
    await this.expenseRepo.save(expense);
    return this.getExpenseById(tenantId, schoolId, id);
  }

  async disburseExpense(
    tenantId: string,
    schoolId: string,
    userId: string,
    id: string,
  ): Promise<Expense> {
    const expense = await this.getExpenseById(tenantId, schoolId, id);
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      expense.status = ExpenseStatus.PAID;
      expense.paidAt = new Date();
      expense.updatedBy = userId;

      await queryRunner.manager.save(Expense, expense);

      if (expense.treasuryAccountId) {
        const account = await queryRunner.manager.findOne(TreasuryAccount, {
          where: { id: expense.treasuryAccountId },
        });
        if (account) {
          account.currentBalance = Number(account.currentBalance) - Number(expense.amount);
          account.updatedBy = userId;
          await queryRunner.manager.save(TreasuryAccount, account);
        }
      }

      await queryRunner.commitTransaction();
      return this.getExpenseById(tenantId, schoolId, id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ==========================================
  // 4. TREASURY SUMMARY & CASH FLOW LEDGER
  // ==========================================
  async getTreasurySummary(tenantId: string, schoolId: string) {
    // 1. Fee Inflows
    const feeInflow = await this.feePaymentRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where('p.school_id = :schoolId', { schoolId })
      .andWhere('p.status = :status', { status: FeePaymentStatus.SUCCESS })
      .andWhere('p.deleted_at IS NULL')
      .getRawOne();

    // 2. Non-Fee Inflows
    const nonFeeInflow = await this.incomeRepo
      .createQueryBuilder('i')
      .select('SUM(i.amount)', 'total')
      .where('i.school_id = :schoolId', { schoolId })
      .andWhere('i.deleted_at IS NULL')
      .getRawOne();

    // 3. Salary Outflows
    const payrollOutflow = await this.payrollRepo
      .createQueryBuilder('pr')
      .select('SUM(pr.total_net_amount)', 'total')
      .where('pr.school_id = :schoolId', { schoolId })
      .andWhere('pr.status = :status', { status: PayrollStatus.PAID })
      .andWhere('pr.deleted_at IS NULL')
      .getRawOne();

    // 4. Expense Outflows
    const expenseOutflow = await this.expenseRepo
      .createQueryBuilder('e')
      .select('SUM(e.amount)', 'total')
      .where('e.school_id = :schoolId', { schoolId })
      .andWhere('e.status = :status', { status: ExpenseStatus.PAID })
      .andWhere('e.deleted_at IS NULL')
      .getRawOne();

    const totalInflow = (Number(feeInflow?.total) || 0) + (Number(nonFeeInflow?.total) || 0);
    const totalOutflow =
      (Number(payrollOutflow?.total) || 0) + (Number(expenseOutflow?.total) || 0);
    const netLiquidity = totalInflow - totalOutflow;

    const accounts = await this.accountRepo.find({
      where: { schoolId, deletedAt: null as any },
    });
    const totalAccountBalance = accounts.reduce(
      (acc, curr) => acc + Number(curr.currentBalance),
      0,
    );

    return {
      totalInflow,
      totalOutflow,
      netLiquidity,
      totalAccountBalance: totalAccountBalance > 0 ? totalAccountBalance : netLiquidity,
      feeInflow: Number(feeInflow?.total) || 0,
      nonFeeInflow: Number(nonFeeInflow?.total) || 0,
      payrollOutflow: Number(payrollOutflow?.total) || 0,
      expenseOutflow: Number(expenseOutflow?.total) || 0,
    };
  }

  async getCashFlowLedger(tenantId: string, schoolId: string) {
    const incomes = await this.incomeRepo.find({
      where: { schoolId, deletedAt: null as any },
      relations: { incomeCategory: true },
      order: { transactionDate: 'DESC' },
      take: 20,
    });

    const expenses = await this.expenseRepo.find({
      where: { schoolId, deletedAt: null as any },
      relations: { expenseCategory: true },
      order: { expenseDate: 'DESC' },
      take: 20,
    });

    const flow = [
      ...incomes.map((i) => ({
        id: i.id,
        date: i.transactionDate,
        type: 'INFLOW',
        category: i.incomeCategory?.name || 'Income',
        title: i.title,
        reference: i.receiptNumber || i.referenceNumber,
        amount: Number(i.amount),
        method: i.paymentMethod,
      })),
      ...expenses.map((e) => ({
        id: e.id,
        date: e.expenseDate,
        type: 'OUTFLOW',
        category: e.expenseCategory?.name || 'Expense',
        title: e.title,
        reference: e.voucherNumber,
        amount: Number(e.amount),
        method: e.paymentMethod,
        status: e.status,
      })),
    ];

    flow.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return flow;
  }
}
