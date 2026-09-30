import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SalaryComponent, SalaryComponentType, SalaryCalculationType } from './entities/salary-component.entity';
import { SalaryStructure } from './entities/salary-structure.entity';
import { SalaryStructureItem } from './entities/salary-structure-item.entity';
import { StaffSalaryAssignment } from './entities/staff-salary-assignment.entity';
import { Payroll, PayrollStatus } from './entities/payroll.entity';
import { PayrollItem } from './entities/payroll-item.entity';
import { SalaryPayment } from './entities/salary-payment.entity';
import { Staff } from '../staff/entities/staff.entity';
import { StaffAttendance } from '../attendance/entities/staff-attendance.entity';
import { AuditService } from '../audit/audit.service';
import { CreateSalaryComponentDto, UpdateSalaryComponentDto } from './dto/create-salary-component.dto';
import { CreateSalaryStructureDto, UpdateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { AssignStaffSalaryDto } from './dto/assign-staff-salary.dto';
import { GeneratePayrollDto, DisbursePayrollDto } from './dto/generate-payroll.dto';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(SalaryComponent)
    private readonly componentRepo: Repository<SalaryComponent>,
    @InjectRepository(SalaryStructure)
    private readonly structureRepo: Repository<SalaryStructure>,
    @InjectRepository(SalaryStructureItem)
    private readonly structureItemRepo: Repository<SalaryStructureItem>,
    @InjectRepository(StaffSalaryAssignment)
    private readonly assignmentRepo: Repository<StaffSalaryAssignment>,
    @InjectRepository(Payroll)
    private readonly payrollRepo: Repository<Payroll>,
    @InjectRepository(PayrollItem)
    private readonly payrollItemRepo: Repository<PayrollItem>,
    @InjectRepository(SalaryPayment)
    private readonly paymentRepo: Repository<SalaryPayment>,
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
    @InjectRepository(StaffAttendance)
    private readonly staffAttendanceRepo: Repository<StaffAttendance>,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  // ==========================================
  // 1. SALARY COMPONENTS
  // ==========================================
  async getComponents(tenantId: string, schoolId: string): Promise<SalaryComponent[]> {
    return this.componentRepo.find({
      where: { schoolId, deletedAt: null as any },
      order: { componentType: 'ASC', name: 'ASC' },
    });
  }

  async createComponent(
    tenantId: string,
    schoolId: string,
    userId: string,
    dto: CreateSalaryComponentDto,
  ): Promise<SalaryComponent> {
    const existing = await this.componentRepo.findOne({
      where: { schoolId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Salary component with code '${dto.code}' already exists`);
    }

    const component = this.componentRepo.create({
      ...dto,
      tenantId,
      schoolId,
      createdBy: userId,
    });

    const saved = await this.componentRepo.save(component);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId,
      action: 'CREATE',
      module: 'PAYROLL',
      entity: 'SalaryComponent',
      entityId: saved.id,
      newValue: saved,
    });

    return saved;
  }

  async updateComponent(
    tenantId: string,
    schoolId: string,
    userId: string,
    id: string,
    dto: UpdateSalaryComponentDto,
  ): Promise<SalaryComponent> {
    const component = await this.componentRepo.findOne({
      where: { id, schoolId, deletedAt: null as any },
    });
    if (!component) {
      throw new NotFoundException('Salary component not found');
    }

    Object.assign(component, dto);
    component.updatedBy = userId;
    return this.componentRepo.save(component);
  }

  // ==========================================
  // 2. SALARY STRUCTURES
  // ==========================================
  async getStructures(tenantId: string, schoolId: string): Promise<SalaryStructure[]> {
    return this.structureRepo.find({
      where: { schoolId, deletedAt: null as any },
      relations: {
        items: {
          salaryComponent: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async createStructure(
    tenantId: string,
    schoolId: string,
    userId: string,
    dto: CreateSalaryStructureDto,
  ): Promise<SalaryStructure> {
    const existing = await this.structureRepo.findOne({
      where: { schoolId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Salary structure code '${dto.code}' already exists`);
    }

    const structure = this.structureRepo.create({
      tenantId,
      schoolId,
      name: dto.name,
      code: dto.code,
      description: dto.description,
      createdBy: userId,
    });

    const saved = await this.structureRepo.save(structure);

    if (dto.items && dto.items.length > 0) {
      const items = dto.items.map((item) =>
        this.structureItemRepo.create({
          tenantId,
          schoolId,
          salaryStructureId: saved.id,
          salaryComponentId: item.salaryComponentId,
          calculationType: item.calculationType || SalaryCalculationType.FIXED,
          value: item.value,
          createdBy: userId,
        }),
      );
      await this.structureItemRepo.save(items);
    }

    return this.structureRepo.findOneOrFail({
      where: { id: saved.id },
      relations: {
        items: {
          salaryComponent: true,
        },
      },
    });
  }

  // ==========================================
  // 3. STAFF SALARY ASSIGNMENTS
  // ==========================================
  async getStaffAssignments(tenantId: string, schoolId: string): Promise<StaffSalaryAssignment[]> {
    return this.assignmentRepo.find({
      where: { schoolId, deletedAt: null as any },
      relations: {
        staff: {
          department: true,
          designation: true,
        },
        salaryStructure: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async assignStaffSalary(
    tenantId: string,
    schoolId: string,
    userId: string,
    dto: AssignStaffSalaryDto,
  ): Promise<StaffSalaryAssignment> {
    let assignment = await this.assignmentRepo.findOne({
      where: { schoolId, staffId: dto.staffId },
    });

    if (assignment) {
      Object.assign(assignment, dto);
      assignment.updatedBy = userId;
    } else {
      assignment = this.assignmentRepo.create({
        ...dto,
        tenantId,
        schoolId,
        createdBy: userId,
      });
    }

    return this.assignmentRepo.save(assignment);
  }

  // ==========================================
  // 4. MONTHLY PAYROLL EXECUTION
  // ==========================================
  async getPayrolls(tenantId: string, schoolId: string): Promise<Payroll[]> {
    return this.payrollRepo.find({
      where: { schoolId, deletedAt: null as any },
      relations: {
        processedByUser: true,
        approvedByUser: true,
      },
      order: { year: 'DESC', month: 'DESC' },
    });
  }

  async getPayrollById(tenantId: string, schoolId: string, id: string): Promise<Payroll> {
    const payroll = await this.payrollRepo.findOne({
      where: { id, schoolId, deletedAt: null as any },
      relations: {
        processedByUser: true,
        approvedByUser: true,
        items: {
          staff: {
            department: true,
            designation: true,
          },
          payments: true,
        },
      },
    });
    if (!payroll) {
      throw new NotFoundException('Payroll batch not found');
    }
    return payroll;
  }

  async generateMonthlyPayroll(
    tenantId: string,
    schoolId: string,
    userId: string,
    dto: GeneratePayrollDto,
  ): Promise<Payroll> {
    const existing = await this.payrollRepo.findOne({
      where: { schoolId, month: dto.month, year: dto.year },
    });
    if (existing && existing.status === PayrollStatus.PAID) {
      throw new BadRequestException('Payroll for this month and year has already been paid and finalized.');
    }

    // Get all staff with active salary assignments
    const assignments = await this.assignmentRepo.find({
      where: { schoolId, status: 'ACTIVE', deletedAt: null as any },
      relations: {
        staff: true,
        salaryStructure: {
          items: {
            salaryComponent: true,
          },
        },
      },
    });

    if (assignments.length === 0) {
      throw new BadRequestException('No staff members have active salary structures assigned.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // If draft exists, delete previous items
      let payroll = existing;
      if (!payroll) {
        payroll = this.payrollRepo.create({
          tenantId,
          schoolId,
          academicYearId: dto.academicYearId,
          month: dto.month,
          year: dto.year,
          payrollTitle: dto.payrollTitle,
          status: PayrollStatus.CALCULATED,
          processedBy: userId,
          notes: dto.notes,
          createdBy: userId,
        });
        payroll = await queryRunner.manager.save(Payroll, payroll);
      } else {
        await queryRunner.manager.delete(PayrollItem, { payrollId: payroll.id });
        payroll.status = PayrollStatus.CALCULATED;
        payroll.processedBy = userId;
        payroll.notes = dto.notes;
        payroll.updatedBy = userId;
      }

      let totalGross = 0;
      let totalDeductions = 0;
      let totalNet = 0;
      const payrollItems: Partial<PayrollItem>[] = [];

      for (const assign of assignments) {
        const grossSalary = Number(assign.baseGrossSalary) || 40000;
        const basicSalary = grossSalary * 0.5; // Standard 50% basic rule

        // Compute attendance & unpaid leaves
        // Count absences in that month/year
        const startDate = `${dto.year}-${String(dto.month).padStart(2, '0')}-01`;
        const endDate = `${dto.year}-${String(dto.month).padStart(2, '0')}-28`;

        const absentRecords = await this.staffAttendanceRepo
          .createQueryBuilder('sa')
          .where('sa.school_id = :schoolId', { schoolId })
          .andWhere('sa.staff_id = :staffId', { staffId: assign.staffId })
          .andWhere('sa.status IN (:...statuses)', { statuses: ['ABSENT'] })
          .andWhere('sa.attendance_date >= :startDate AND sa.attendance_date <= :endDate', {
            startDate,
            endDate,
          })
          .getCount();

        const unpaidDays = absentRecords || 0;
        const perDayRate = grossSalary / 30;
        const lopDeduction = Math.round(unpaidDays * perDayRate);

        // Earnings & Deductions breakdowns
        const earnings: { name: string; amount: number }[] = [
          { name: 'Basic Salary', amount: basicSalary },
          { name: 'House Rent Allowance (HRA)', amount: basicSalary * 0.4 },
          { name: 'Special Allowance', amount: grossSalary - basicSalary - basicSalary * 0.4 },
        ];

        const deductions: { name: string; amount: number }[] = [
          { name: 'Provident Fund (PF)', amount: Math.round(basicSalary * 0.12) },
          { name: 'Professional Tax', amount: 200 },
        ];

        if (lopDeduction > 0) {
          deductions.push({ name: `Loss of Pay (${unpaidDays} Days)`, amount: lopDeduction });
        }

        const staffEarnings = earnings.reduce((a, b) => a + b.amount, 0);
        const staffDeductions = deductions.reduce((a, b) => a + b.amount, 0);
        const netSalary = Math.max(0, staffEarnings - staffDeductions);

        totalGross += staffEarnings;
        totalDeductions += staffDeductions;
        totalNet += netSalary;

        payrollItems.push({
          tenantId,
          schoolId,
          payrollId: payroll.id,
          staffId: assign.staffId,
          basicSalary,
          totalEarnings: staffEarnings,
          totalDeductions: staffDeductions,
          unpaidLeavesCount: unpaidDays,
          lopDeductionAmount: lopDeduction,
          netSalary,
          breakdown: { earnings, deductions },
          status: 'PENDING',
          createdBy: userId,
        });
      }

      payroll.totalStaffCount = assignments.length;
      payroll.totalGrossAmount = totalGross;
      payroll.totalDeductionsAmount = totalDeductions;
      payroll.totalNetAmount = totalNet;

      const savedPayroll = await queryRunner.manager.save(Payroll, payroll);

      for (const item of payrollItems) {
        item.payrollId = savedPayroll.id;
        await queryRunner.manager.save(PayrollItem, item);
      }

      await queryRunner.commitTransaction();

      await this.auditService.log({
        tenantId,
        schoolId,
        userId,
        action: 'CREATE',
        module: 'PAYROLL',
        entity: 'Payroll',
        entityId: savedPayroll.id,
        newValue: savedPayroll,
      });

      return this.getPayrollById(tenantId, schoolId, savedPayroll.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async approvePayroll(
    tenantId: string,
    schoolId: string,
    userId: string,
    id: string,
  ): Promise<Payroll> {
    const payroll = await this.payrollRepo.findOne({
      where: { id, schoolId, deletedAt: null as any },
    });
    if (!payroll) {
      throw new NotFoundException('Payroll batch not found');
    }

    payroll.status = PayrollStatus.APPROVED;
    payroll.approvedBy = userId;
    payroll.updatedBy = userId;

    await this.payrollRepo.save(payroll);
    return this.getPayrollById(tenantId, schoolId, id);
  }

  async disbursePayroll(
    tenantId: string,
    schoolId: string,
    userId: string,
    id: string,
    dto: DisbursePayrollDto,
  ): Promise<Payroll> {
    const payroll = await this.getPayrollById(tenantId, schoolId, id);
    if (!payroll) {
      throw new NotFoundException('Payroll batch not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const today = new Date().toISOString().split('T')[0];

      for (const item of payroll.items) {
        item.status = 'PAID';
        await queryRunner.manager.save(PayrollItem, item);

        const payment = this.paymentRepo.create({
          tenantId,
          schoolId,
          payrollItemId: item.id,
          paymentDate: today,
          amount: item.netSalary,
          paymentMethod: dto.paymentMethod,
          transactionReference: `${dto.transactionReferencePrefix || 'SAL'}-${item.staff?.employeeCode || Date.now()}`,
          status: 'PAID',
          createdBy: userId,
        });

        await queryRunner.manager.save(SalaryPayment, payment);
      }

      payroll.status = PayrollStatus.PAID;
      payroll.paidAt = new Date();
      payroll.updatedBy = userId;

      await queryRunner.manager.save(Payroll, payroll);

      await queryRunner.commitTransaction();

      return this.getPayrollById(tenantId, schoolId, id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getPayslip(tenantId: string, schoolId: string, itemId: string): Promise<PayrollItem> {
    const item = await this.payrollItemRepo.findOne({
      where: { id: itemId, schoolId, deletedAt: null as any },
      relations: {
        payroll: true,
        staff: {
          department: true,
          designation: true,
        },
        payments: true,
      },
    });
    if (!item) {
      throw new NotFoundException('Payslip not found');
    }
    return item;
  }

  async getPayrollSummary(tenantId: string, schoolId: string) {
    const totalDisbursed = await this.payrollRepo
      .createQueryBuilder('p')
      .select('SUM(p.total_net_amount)', 'total')
      .where('p.school_id = :schoolId', { schoolId })
      .andWhere('p.status = :status', { status: PayrollStatus.PAID })
      .andWhere('p.deleted_at IS NULL')
      .getRawOne();

    const latestPayroll = await this.payrollRepo.findOne({
      where: { schoolId, deletedAt: null as any },
      order: { year: 'DESC', month: 'DESC' },
    });

    const staffCount = await this.staffRepo.count({
      where: { schoolId, deletedAt: null as any },
    });

    return {
      totalDisbursed: Number(totalDisbursed?.total) || 0,
      activeStaffCount: staffCount,
      latestBatch: latestPayroll
        ? `${latestPayroll.month}/${latestPayroll.year} (${latestPayroll.status})`
        : 'None',
      lastBatchAmount: latestPayroll ? Number(latestPayroll.totalNetAmount) : 0,
    };
  }
}
