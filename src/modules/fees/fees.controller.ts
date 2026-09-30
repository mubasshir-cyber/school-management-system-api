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
import { FeesService } from './fees.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateFeeTypeDto, UpdateFeeTypeDto } from './dto/create-fee-type.dto';
import { CreateFeeStructureDto, UpdateFeeStructureDto } from './dto/create-fee-structure.dto';
import { CreateFeeDiscountDto } from './dto/create-fee-discount.dto';
import { AssignStudentFeeDto } from './dto/assign-student-fee.dto';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto';
import { CollectFeePaymentDto } from './dto/collect-fee-payment.dto';
import { FeeInvoiceStatus } from './entities/fee-invoice.entity';

@Controller('fees')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  // 1. Fee Types / Heads
  @Get('types')
  @RequirePermissions('fees.types.read')
  async getFeeTypes(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.feesService.getFeeTypes(tenantId, schoolId);
  }

  @Post('types')
  @RequirePermissions('fees.types.create')
  async createFeeType(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateFeeTypeDto,
  ) {
    return this.feesService.createFeeType(tenantId, schoolId, userId, dto);
  }

  @Patch('types/:id')
  @RequirePermissions('fees.types.update')
  async updateFeeType(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFeeTypeDto,
  ) {
    return this.feesService.updateFeeType(tenantId, schoolId, userId, id, dto);
  }

  // 2. Fee Structures
  @Get('structures')
  @RequirePermissions('fees.structures.read')
  async getFeeStructures(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.feesService.getFeeStructures(tenantId, schoolId, academicYearId);
  }

  @Get('structures/:id')
  @RequirePermissions('fees.structures.read')
  async getFeeStructureById(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.feesService.getFeeStructureById(tenantId, schoolId, id);
  }

  @Post('structures')
  @RequirePermissions('fees.structures.create')
  async createFeeStructure(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateFeeStructureDto,
  ) {
    return this.feesService.createFeeStructure(tenantId, schoolId, userId, dto);
  }

  // 3. Fee Discounts
  @Get('discounts')
  @RequirePermissions('fees.discounts.read')
  async getDiscounts(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.feesService.getDiscounts(tenantId, schoolId);
  }

  @Post('discounts')
  @RequirePermissions('fees.discounts.create')
  async createDiscount(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateFeeDiscountDto,
  ) {
    return this.feesService.createDiscount(tenantId, schoolId, userId, dto);
  }

  // 4. Student Fee Assignment
  @Post('assignments')
  @RequirePermissions('fees.assignments.create')
  async assignFeeStructure(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: AssignStudentFeeDto,
  ) {
    return this.feesService.assignFeeStructure(tenantId, schoolId, userId, dto);
  }

  // 5. Invoices
  @Get('invoices')
  @RequirePermissions('fees.invoices.read')
  async getInvoices(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Query('studentId') studentId?: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('status') status?: FeeInvoiceStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.feesService.getInvoices(tenantId, schoolId, {
      studentId,
      academicYearId,
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('invoices/:id')
  @RequirePermissions('fees.invoices.read')
  async getInvoiceById(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.feesService.getInvoiceById(tenantId, schoolId, id);
  }

  @Post('invoices')
  @RequirePermissions('fees.invoices.create')
  async generateInvoice(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: GenerateInvoiceDto,
  ) {
    return this.feesService.generateInvoice(tenantId, schoolId, userId, dto);
  }

  // 6. Payments & POS Collection
  @Get('payments')
  @RequirePermissions('fees.payments.read')
  async getPayments(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Query('studentId') studentId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.feesService.getPayments(tenantId, schoolId, {
      studentId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('payments/:id')
  @RequirePermissions('fees.payments.read')
  async getPaymentById(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.feesService.getPaymentById(tenantId, schoolId, id);
  }

  @Post('payments')
  @RequirePermissions('fees.payments.create')
  async collectPayment(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CollectFeePaymentDto,
  ) {
    return this.feesService.collectPayment(tenantId, schoolId, userId, dto);
  }

  // 7. Student Ledger & Summary
  @Get('ledgers/student/:studentId')
  @RequirePermissions('fees.ledgers.read')
  async getStudentLedger(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ) {
    return this.feesService.getStudentLedger(tenantId, schoolId, studentId);
  }

  @Get('summary')
  @RequirePermissions('fees.summary.read')
  async getFeeSummary(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    return this.feesService.getFeeSummary(tenantId, schoolId);
  }
}
