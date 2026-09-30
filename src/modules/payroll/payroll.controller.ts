import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateSalaryComponentDto, UpdateSalaryComponentDto } from './dto/create-salary-component.dto';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { AssignStaffSalaryDto } from './dto/assign-staff-salary.dto';
import { GeneratePayrollDto, DisbursePayrollDto } from './dto/generate-payroll.dto';

@Controller('payroll')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  // 1. Components
  @Get('components')
  @RequirePermissions('payroll.components.read')
  async getComponents(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.payrollService.getComponents(tenantId, schoolId);
  }

  @Post('components')
  @RequirePermissions('payroll.components.create')
  async createComponent(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateSalaryComponentDto,
  ) {
    return this.payrollService.createComponent(tenantId, schoolId, userId, dto);
  }

  @Patch('components/:id')
  @RequirePermissions('payroll.components.update')
  async updateComponent(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSalaryComponentDto,
  ) {
    return this.payrollService.updateComponent(tenantId, schoolId, userId, id, dto);
  }

  // 2. Structures
  @Get('structures')
  @RequirePermissions('payroll.structures.read')
  async getStructures(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.payrollService.getStructures(tenantId, schoolId);
  }

  @Post('structures')
  @RequirePermissions('payroll.structures.create')
  async createStructure(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateSalaryStructureDto,
  ) {
    return this.payrollService.createStructure(tenantId, schoolId, userId, dto);
  }

  // 3. Staff Salary Assignments
  @Get('assignments')
  @RequirePermissions('payroll.assignments.read')
  async getStaffAssignments(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.payrollService.getStaffAssignments(tenantId, schoolId);
  }

  @Post('assignments')
  @RequirePermissions('payroll.assignments.create')
  async assignStaffSalary(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: AssignStaffSalaryDto,
  ) {
    return this.payrollService.assignStaffSalary(tenantId, schoolId, userId, dto);
  }

  // 4. Monthly Payroll Generation & Execution
  @Get('batches')
  @RequirePermissions('payroll.batches.read')
  async getPayrolls(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.payrollService.getPayrolls(tenantId, schoolId);
  }

  @Get('batches/:id')
  @RequirePermissions('payroll.batches.read')
  async getPayrollById(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.payrollService.getPayrollById(tenantId, schoolId, id);
  }

  @Post('generate')
  @RequirePermissions('payroll.batches.create')
  async generateMonthlyPayroll(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: GeneratePayrollDto,
  ) {
    return this.payrollService.generateMonthlyPayroll(tenantId, schoolId, userId, dto);
  }

  @Patch('batches/:id/approve')
  @RequirePermissions('payroll.batches.update')
  async approvePayroll(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.payrollService.approvePayroll(tenantId, schoolId, userId, id);
  }

  @Post('batches/:id/disburse')
  @RequirePermissions('payroll.batches.update')
  async disbursePayroll(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DisbursePayrollDto,
  ) {
    return this.payrollService.disbursePayroll(tenantId, schoolId, userId, id, dto);
  }

  // 5. Payslips & Summary
  @Get('payslips/:id')
  @RequirePermissions('payroll.payslips.read')
  async getPayslip(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.payrollService.getPayslip(tenantId, schoolId, id);
  }

  @Get('summary')
  @RequirePermissions('payroll.summary.read')
  async getPayrollSummary(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.payrollService.getPayrollSummary(tenantId, schoolId);
  }
}
