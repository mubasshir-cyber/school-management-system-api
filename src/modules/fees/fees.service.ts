import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FeeType } from './entities/fee-type.entity';
import { FeeStructure } from './entities/fee-structure.entity';
import { FeeStructureItem } from './entities/fee-structure-item.entity';
import { FeeDiscount } from './entities/fee-discount.entity';
import { StudentFeeAssignment } from './entities/student-fee-assignment.entity';
import { FeeInvoice, FeeInvoiceStatus } from './entities/fee-invoice.entity';
import { FeeInvoiceItem } from './entities/fee-invoice-item.entity';
import { FeePayment, FeePaymentStatus } from './entities/fee-payment.entity';
import { FeeLedger, FeeLedgerCategory, FeeLedgerEntry } from './entities/fee-ledger.entity';
import { Student } from '../students/entities/student.entity';
import { StudentEnrollment } from '../enrollments/entities/student-enrollment.entity';
import { NumberingSequenceService } from '../students/services/numbering-sequence.service';
import { AuditService } from '../audit/audit.service';
import { SequenceType } from '../../common/enums/status.enum';
import { CreateFeeTypeDto, UpdateFeeTypeDto } from './dto/create-fee-type.dto';
import { CreateFeeStructureDto, UpdateFeeStructureDto } from './dto/create-fee-structure.dto';
import { CreateFeeDiscountDto, UpdateFeeDiscountDto } from './dto/create-fee-discount.dto';
import { AssignStudentFeeDto } from './dto/assign-student-fee.dto';
import { GenerateInvoiceDto, BulkGenerateInvoicesDto } from './dto/generate-invoice.dto';
import { CollectFeePaymentDto } from './dto/collect-fee-payment.dto';

@Injectable()
export class FeesService {
  constructor(
    @InjectRepository(FeeType)
    private readonly feeTypeRepo: Repository<FeeType>,
    @InjectRepository(FeeStructure)
    private readonly feeStructureRepo: Repository<FeeStructure>,
    @InjectRepository(FeeStructureItem)
    private readonly feeStructureItemRepo: Repository<FeeStructureItem>,
    @InjectRepository(FeeDiscount)
    private readonly feeDiscountRepo: Repository<FeeDiscount>,
    @InjectRepository(StudentFeeAssignment)
    private readonly assignmentRepo: Repository<StudentFeeAssignment>,
    @InjectRepository(FeeInvoice)
    private readonly invoiceRepo: Repository<FeeInvoice>,
    @InjectRepository(FeeInvoiceItem)
    private readonly invoiceItemRepo: Repository<FeeInvoiceItem>,
    @InjectRepository(FeePayment)
    private readonly paymentRepo: Repository<FeePayment>,
    @InjectRepository(FeeLedger)
    private readonly ledgerRepo: Repository<FeeLedger>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(StudentEnrollment)
    private readonly enrollmentRepo: Repository<StudentEnrollment>,
    private readonly numberingSequenceService: NumberingSequenceService,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  // ==========================================
  // 1. FEE TYPES (Fee Heads)
  // ==========================================
  async getFeeTypes(tenantId: string, schoolId: string): Promise<FeeType[]> {
    return this.feeTypeRepo.find({
      where: { schoolId, deletedAt: null as any },
      order: { name: 'ASC' },
    });
  }

  async createFeeType(
    tenantId: string,
    schoolId: string,
    userId: string,
    dto: CreateFeeTypeDto,
  ): Promise<FeeType> {
    const existing = await this.feeTypeRepo.findOne({
      where: { schoolId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Fee type code '${dto.code}' already exists`);
    }

    const feeType = this.feeTypeRepo.create({
      ...dto,
      tenantId,
      schoolId,
      createdBy: userId,
    });

    const saved = await this.feeTypeRepo.save(feeType);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId,
      action: 'CREATE',
      module: 'FEES',
      entity: 'FeeType',
      entityId: saved.id,
      newValue: saved,
    });

    return saved;
  }

  async updateFeeType(
    tenantId: string,
    schoolId: string,
    userId: string,
    id: string,
    dto: UpdateFeeTypeDto,
  ): Promise<FeeType> {
    const feeType = await this.feeTypeRepo.findOne({
      where: { id, schoolId, deletedAt: null as any },
    });
    if (!feeType) {
      throw new NotFoundException('Fee type not found');
    }

    Object.assign(feeType, dto);
    feeType.updatedBy = userId;
    return this.feeTypeRepo.save(feeType);
  }

  // ==========================================
  // 2. FEE STRUCTURES
  // ==========================================
  async getFeeStructures(
    tenantId: string,
    schoolId: string,
    academicYearId?: string,
  ): Promise<FeeStructure[]> {
    const query = this.feeStructureRepo
      .createQueryBuilder('fs')
      .leftJoinAndSelect('fs.academicYear', 'ay')
      .leftJoinAndSelect('fs.class', 'cls')
      .leftJoinAndSelect('fs.items', 'item')
      .leftJoinAndSelect('item.feeType', 'ft')
      .where('fs.school_id = :schoolId', { schoolId })
      .andWhere('fs.deleted_at IS NULL');

    if (academicYearId) {
      query.andWhere('fs.academic_year_id = :academicYearId', { academicYearId });
    }

    return query.orderBy('fs.created_at', 'DESC').getMany();
  }

  async getFeeStructureById(
    tenantId: string,
    schoolId: string,
    id: string,
  ): Promise<FeeStructure> {
    const fs = await this.feeStructureRepo.findOne({
      where: { id, schoolId, deletedAt: null as any },
      relations: {
        academicYear: true,
        class: true,
        items: {
          feeType: true,
        },
      },
    });
    if (!fs) {
      throw new NotFoundException('Fee structure not found');
    }
    return fs;
  }

  async createFeeStructure(
    tenantId: string,
    schoolId: string,
    userId: string,
    dto: CreateFeeStructureDto,
  ): Promise<FeeStructure> {
    const existing = await this.feeStructureRepo.findOne({
      where: { schoolId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Fee structure with code '${dto.code}' already exists`);
    }

    const structure = this.feeStructureRepo.create({
      tenantId,
      schoolId,
      academicYearId: dto.academicYearId,
      classId: dto.classId,
      name: dto.name,
      code: dto.code,
      frequency: dto.frequency,
      description: dto.description,
      createdBy: userId,
    });

    const saved = await this.feeStructureRepo.save(structure);

    if (dto.items && dto.items.length > 0) {
      const items = dto.items.map((item) =>
        this.feeStructureItemRepo.create({
          tenantId,
          schoolId,
          feeStructureId: saved.id,
          feeTypeId: item.feeTypeId,
          amount: item.amount,
          dueDayOfMonth: item.dueDayOfMonth ?? 10,
          lateFineAmount: item.lateFineAmount ?? 0,
          graceDays: item.graceDays ?? 5,
          createdBy: userId,
        }),
      );
      await this.feeStructureItemRepo.save(items);
    }

    return this.getFeeStructureById(tenantId, schoolId, saved.id);
  }

  // ==========================================
  // 3. FEE DISCOUNTS / CONCESSIONS
  // ==========================================
  async getDiscounts(tenantId: string, schoolId: string): Promise<FeeDiscount[]> {
    return this.feeDiscountRepo.find({
      where: { schoolId, deletedAt: null as any },
      order: { name: 'ASC' },
    });
  }

  async createDiscount(
    tenantId: string,
    schoolId: string,
    userId: string,
    dto: CreateFeeDiscountDto,
  ): Promise<FeeDiscount> {
    const existing = await this.feeDiscountRepo.findOne({
      where: { schoolId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Discount with code '${dto.code}' already exists`);
    }

    const discount = this.feeDiscountRepo.create({
      ...dto,
      tenantId,
      schoolId,
      createdBy: userId,
    });

    return this.feeDiscountRepo.save(discount);
  }

  // ==========================================
  // 4. STUDENT FEE ASSIGNMENTS
  // ==========================================
  async assignFeeStructure(
    tenantId: string,
    schoolId: string,
    userId: string,
    dto: AssignStudentFeeDto,
  ): Promise<StudentFeeAssignment> {
    let assignment = await this.assignmentRepo.findOne({
      where: {
        schoolId,
        academicYearId: dto.academicYearId,
        studentId: dto.studentId,
        feeStructureId: dto.feeStructureId,
      },
    });

    if (assignment) {
      assignment.feeDiscountId = dto.feeDiscountId;
      assignment.customDiscountAmount = dto.customDiscountAmount ?? 0;
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
  // 5. INVOICES & GENERATION
  // ==========================================
  async getInvoices(
    tenantId: string,
    schoolId: string,
    params?: {
      studentId?: string;
      academicYearId?: string;
      status?: FeeInvoiceStatus;
      page?: number;
      limit?: number;
    },
  ) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.invoiceRepo
      .createQueryBuilder('inv')
      .leftJoinAndSelect('inv.student', 'stu')
      .leftJoinAndSelect('inv.academicYear', 'ay')
      .leftJoinAndSelect('inv.items', 'item')
      .leftJoinAndSelect('item.feeType', 'ft')
      .where('inv.school_id = :schoolId', { schoolId })
      .andWhere('inv.deleted_at IS NULL');

    if (params?.studentId) {
      query.andWhere('inv.student_id = :studentId', { studentId: params.studentId });
    }
    if (params?.academicYearId) {
      query.andWhere('inv.academic_year_id = :academicYearId', {
        academicYearId: params.academicYearId,
      });
    }
    if (params?.status) {
      query.andWhere('inv.status = :status', { status: params.status });
    }

    const [items, total] = await query
      .orderBy('inv.created_at', 'DESC')
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

  async getInvoiceById(tenantId: string, schoolId: string, id: string): Promise<FeeInvoice> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id, schoolId, deletedAt: null as any },
      relations: {
        student: true,
        academicYear: true,
        items: {
          feeType: true,
        },
      },
    });
    if (!invoice) {
      throw new NotFoundException('Fee invoice not found');
    }
    return invoice;
  }

  async generateInvoice(
    tenantId: string,
    schoolId: string,
    userId: string,
    dto: GenerateInvoiceDto,
  ): Promise<FeeInvoice> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Generate Invoice Number
      let invoiceNumber: string;
      try {
        invoiceNumber = await this.numberingSequenceService.getNextSequence(
          tenantId,
          schoolId,
          SequenceType.INVOICE,
          undefined,
          queryRunner.manager,
        );
      } catch {
        invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
      }

      // 2. Compute totals
      let subtotal = 0;
      let totalDiscount = 0;

      const invoiceItemsToSave: Partial<FeeInvoiceItem>[] = [];

      for (const itm of dto.items) {
        const itemAmount = Number(itm.amount) || 0;
        const itmDiscount = Number(itm.discountAmount) || 0;
        const net = itemAmount - itmDiscount;
        subtotal += itemAmount;
        totalDiscount += itmDiscount;

        invoiceItemsToSave.push({
          tenantId,
          schoolId,
          feeTypeId: itm.feeTypeId,
          amount: itemAmount,
          discountAmount: itmDiscount,
          netAmount: net,
          createdBy: userId,
        });
      }

      const totalAmount = subtotal - totalDiscount;

      // 3. Save Invoice
      const invoice = this.invoiceRepo.create({
        tenantId,
        schoolId,
        studentId: dto.studentId,
        academicYearId: dto.academicYearId,
        invoiceNumber,
        title: dto.title,
        invoiceDate: dto.invoiceDate,
        dueDate: dto.dueDate,
        subtotal,
        discountAmount: totalDiscount,
        fineAmount: 0,
        totalAmount,
        paidAmount: 0,
        balanceAmount: totalAmount,
        status: FeeInvoiceStatus.UNPAID,
        notes: dto.notes,
        createdBy: userId,
      });

      const savedInvoice = await queryRunner.manager.save(FeeInvoice, invoice);

      for (const item of invoiceItemsToSave) {
        item.feeInvoiceId = savedInvoice.id;
        await queryRunner.manager.save(FeeInvoiceItem, item);
      }

      // 4. Double-entry Ledger: Post DEBIT entry
      const lastLedger = await queryRunner.manager.findOne(FeeLedger, {
        where: { studentId: dto.studentId },
        order: { transactionDate: 'DESC', createdAt: 'DESC' },
      });
      const previousBalance = lastLedger ? Number(lastLedger.balanceAfter) : 0;
      const newBalance = previousBalance + totalAmount;

      const ledgerEntry = this.ledgerRepo.create({
        tenantId,
        schoolId,
        studentId: dto.studentId,
        academicYearId: dto.academicYearId,
        entryType: FeeLedgerEntry.DEBIT,
        category: FeeLedgerCategory.INVOICE,
        feeInvoiceId: savedInvoice.id,
        amount: totalAmount,
        balanceAfter: newBalance,
        referenceNumber: savedInvoice.invoiceNumber,
        description: `Invoice: ${savedInvoice.title} (${savedInvoice.invoiceNumber})`,
        createdBy: userId,
      });

      await queryRunner.manager.save(FeeLedger, ledgerEntry);

      await queryRunner.commitTransaction();

      await this.auditService.log({
        tenantId,
        schoolId,
        userId,
        action: 'CREATE',
        module: 'FEES',
        entity: 'FeeInvoice',
        entityId: savedInvoice.id,
        newValue: savedInvoice,
      });

      return this.getInvoiceById(tenantId, schoolId, savedInvoice.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ==========================================
  // 6. FEE PAYMENT & RECEIPT COLLECTION
  // ==========================================
  async getPayments(
    tenantId: string,
    schoolId: string,
    params?: {
      studentId?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.paymentRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.student', 'stu')
      .leftJoinAndSelect('p.feeInvoice', 'inv')
      .leftJoinAndSelect('p.receivedBy', 'usr')
      .where('p.school_id = :schoolId', { schoolId })
      .andWhere('p.deleted_at IS NULL');

    if (params?.studentId) {
      query.andWhere('p.student_id = :studentId', { studentId: params.studentId });
    }

    const [items, total] = await query
      .orderBy('p.payment_date', 'DESC')
      .addOrderBy('p.created_at', 'DESC')
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

  async getPaymentById(tenantId: string, schoolId: string, id: string): Promise<FeePayment> {
    const payment = await this.paymentRepo.findOne({
      where: { id, schoolId, deletedAt: null as any },
      relations: {
        student: true,
        feeInvoice: true,
        receivedBy: true,
      },
    });
    if (!payment) {
      throw new NotFoundException('Fee payment not found');
    }
    return payment;
  }

  async collectPayment(
    tenantId: string,
    schoolId: string,
    userId: string,
    dto: CollectFeePaymentDto,
  ): Promise<FeePayment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Generate Receipt Number
      let receiptNumber: string;
      try {
        receiptNumber = await this.numberingSequenceService.getNextSequence(
          tenantId,
          schoolId,
          SequenceType.RECEIPT,
          undefined,
          queryRunner.manager,
        );
      } catch {
        receiptNumber = `REC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
      }

      // 2. Create Payment Record
      const payment = this.paymentRepo.create({
        tenantId,
        schoolId,
        studentId: dto.studentId,
        feeInvoiceId: dto.feeInvoiceId,
        receiptNumber,
        paymentDate: dto.paymentDate,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod,
        transactionReference: dto.transactionReference,
        chequeNumber: dto.chequeNumber,
        bankName: dto.bankName,
        status: FeePaymentStatus.SUCCESS,
        remarks: dto.remarks,
        receivedById: userId,
        createdBy: userId,
      });

      const savedPayment = await queryRunner.manager.save(FeePayment, payment);

      // 3. Update Invoice if attached
      let academicYearId = '00000000-0000-0000-0000-000000000001';
      if (dto.feeInvoiceId) {
        const invoice = await queryRunner.manager.findOne(FeeInvoice, {
          where: { id: dto.feeInvoiceId },
        });
        if (invoice) {
          academicYearId = invoice.academicYearId;
          const newPaid = Number(invoice.paidAmount) + Number(dto.amount);
          const newBal = Number(invoice.totalAmount) - newPaid;
          invoice.paidAmount = newPaid;
          invoice.balanceAmount = Math.max(0, newBal);
          invoice.status =
            invoice.balanceAmount <= 0
              ? FeeInvoiceStatus.PAID
              : FeeInvoiceStatus.PARTIALLY_PAID;
          invoice.updatedBy = userId;
          await queryRunner.manager.save(FeeInvoice, invoice);
        }
      }

      // 4. Double-Entry Ledger: Post CREDIT Entry
      const lastLedger = await queryRunner.manager.findOne(FeeLedger, {
        where: { studentId: dto.studentId },
        order: { transactionDate: 'DESC', createdAt: 'DESC' },
      });
      const previousBalance = lastLedger ? Number(lastLedger.balanceAfter) : 0;
      const newBalance = previousBalance - Number(dto.amount);

      const ledgerEntry = this.ledgerRepo.create({
        tenantId,
        schoolId,
        studentId: dto.studentId,
        academicYearId,
        entryType: FeeLedgerEntry.CREDIT,
        category: FeeLedgerCategory.PAYMENT,
        feePaymentId: savedPayment.id,
        feeInvoiceId: dto.feeInvoiceId,
        amount: dto.amount,
        balanceAfter: newBalance,
        referenceNumber: savedPayment.receiptNumber,
        description: `Fee Collection (${dto.paymentMethod}): Receipt ${savedPayment.receiptNumber}`,
        createdBy: userId,
      });

      await queryRunner.manager.save(FeeLedger, ledgerEntry);

      await queryRunner.commitTransaction();

      await this.auditService.log({
        tenantId,
        schoolId,
        userId,
        action: 'CREATE',
        module: 'FEES',
        entity: 'FeePayment',
        entityId: savedPayment.id,
        newValue: savedPayment,
      });

      return this.getPaymentById(tenantId, schoolId, savedPayment.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // ==========================================
  // 7. DOUBLE-ENTRY LEDGER & FINANCIAL SUMMARY
  // ==========================================
  async getStudentLedger(
    tenantId: string,
    schoolId: string,
    studentId: string,
  ): Promise<FeeLedger[]> {
    return this.ledgerRepo.find({
      where: { schoolId, studentId, deletedAt: null as any },
      relations: {
        feeType: true,
        feeInvoice: true,
        feePayment: true,
      },
      order: { transactionDate: 'ASC', createdAt: 'ASC' },
    });
  }

  async getFeeSummary(tenantId: string, schoolId: string) {
    const totalInvoiced = await this.invoiceRepo
      .createQueryBuilder('inv')
      .select('SUM(inv.total_amount)', 'total')
      .where('inv.school_id = :schoolId', { schoolId })
      .andWhere('inv.deleted_at IS NULL')
      .getRawOne();

    const totalCollected = await this.paymentRepo
      .createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where('p.school_id = :schoolId', { schoolId })
      .andWhere('p.status = :status', { status: FeePaymentStatus.SUCCESS })
      .andWhere('p.deleted_at IS NULL')
      .getRawOne();

    const invoiced = Number(totalInvoiced?.total) || 0;
    const collected = Number(totalCollected?.total) || 0;
    const pending = Math.max(0, invoiced - collected);
    const collectionRate = invoiced > 0 ? ((collected / invoiced) * 100).toFixed(1) : '0.0';

    return {
      totalInvoiced: invoiced,
      totalCollected: collected,
      totalPending: pending,
      collectionRate: `${collectionRate}%`,
    };
  }
}
