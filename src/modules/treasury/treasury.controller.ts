import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TreasuryService } from './treasury.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateTreasuryAccountDto } from './dto/create-treasury-account.dto';
import { CreateIncomeCategoryDto } from './dto/create-income-category.dto';
import { RecordIncomeDto } from './dto/record-income.dto';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { CreateExpenseDto, ReviewExpenseDto } from './dto/create-expense.dto';
import { ExpenseStatus } from './entities/expense.entity';

@Controller('treasury')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class TreasuryController {
  constructor(private readonly treasuryService: TreasuryService) {}

  // 1. Treasury Accounts
  @Get('accounts')
  @RequirePermissions('treasury.accounts.read')
  async getAccounts(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.treasuryService.getAccounts(tenantId, schoolId);
  }

  @Post('accounts')
  @RequirePermissions('treasury.accounts.create')
  async createAccount(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateTreasuryAccountDto,
  ) {
    return this.treasuryService.createAccount(tenantId, schoolId, userId, dto);
  }

  // 2. Non-Fee Income
  @Get('income-categories')
  @RequirePermissions('treasury.incomes.read')
  async getIncomeCategories(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.treasuryService.getIncomeCategories(tenantId, schoolId);
  }

  @Post('income-categories')
  @RequirePermissions('treasury.incomes.create')
  async createIncomeCategory(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateIncomeCategoryDto,
  ) {
    return this.treasuryService.createIncomeCategory(tenantId, schoolId, userId, dto);
  }

  @Get('incomes')
  @RequirePermissions('treasury.incomes.read')
  async getIncomes(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Query('incomeCategoryId') incomeCategoryId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.treasuryService.getIncomes(tenantId, schoolId, {
      incomeCategoryId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Post('incomes')
  @RequirePermissions('treasury.incomes.create')
  async recordIncome(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: RecordIncomeDto,
  ) {
    return this.treasuryService.recordIncome(tenantId, schoolId, userId, dto);
  }

  // 3. Expense Categories & Expenses
  @Get('expense-categories')
  @RequirePermissions('treasury.expenses.read')
  async getExpenseCategories(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.treasuryService.getExpenseCategories(tenantId, schoolId);
  }

  @Post('expense-categories')
  @RequirePermissions('treasury.expenses.create')
  async createExpenseCategory(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateExpenseCategoryDto,
  ) {
    return this.treasuryService.createExpenseCategory(tenantId, schoolId, userId, dto);
  }

  @Get('expenses')
  @RequirePermissions('treasury.expenses.read')
  async getExpenses(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Query('expenseCategoryId') expenseCategoryId?: string,
    @Query('status') status?: ExpenseStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.treasuryService.getExpenses(tenantId, schoolId, {
      expenseCategoryId,
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('expenses/:id')
  @RequirePermissions('treasury.expenses.read')
  async getExpenseById(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.treasuryService.getExpenseById(tenantId, schoolId, id);
  }

  @Post('expenses')
  @RequirePermissions('treasury.expenses.create')
  async createExpense(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.treasuryService.createExpense(tenantId, schoolId, userId, dto);
  }

  @Patch('expenses/:id/review')
  @RequirePermissions('treasury.expenses.update')
  async reviewExpense(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewExpenseDto,
  ) {
    return this.treasuryService.reviewExpense(tenantId, schoolId, userId, id, dto);
  }

  @Post('expenses/:id/disburse')
  @RequirePermissions('treasury.expenses.update')
  async disburseExpense(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.treasuryService.disburseExpense(tenantId, schoolId, userId, id);
  }

  // 4. Summary & Reconciled Cash Flow
  @Get('summary')
  @RequirePermissions('treasury.summary.read')
  async getTreasurySummary(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.treasuryService.getTreasurySummary(tenantId, schoolId);
  }

  @Get('cashflow')
  @RequirePermissions('treasury.summary.read')
  async getCashFlowLedger(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.treasuryService.getCashFlowLedger(tenantId, schoolId);
  }
}
