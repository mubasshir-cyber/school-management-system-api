import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { LeaveType } from './entities/leave-type.entity';
import { LeaveRequest } from './entities/leave-request.entity';
import { CreateLeaveTypeDto, UpdateLeaveTypeDto } from './dto/leave-type.dto';
import {
  CreateLeaveRequestDto,
  ReviewLeaveRequestDto,
  LeaveRequestQueryDto,
} from './dto/leave-request.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveType)
    private readonly leaveTypeRepo: Repository<LeaveType>,
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepo: Repository<LeaveRequest>,
    private readonly auditService: AuditService,
  ) {}

  // ===================== LEAVE TYPES =====================

  async createLeaveType(tenantId: string, schoolId: string, dto: CreateLeaveTypeDto, userId?: string): Promise<LeaveType> {
    const existing = await this.leaveTypeRepo.findOne({
      where: { schoolId, code: dto.code, deletedAt: IsNull() },
    });
    if (existing) {
      throw new ConflictException(`Leave type with code '${dto.code}' already exists`);
    }

    const type = this.leaveTypeRepo.create({
      ...dto,
      tenantId,
      schoolId,
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.leaveTypeRepo.save(type);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId,
      action: 'CREATE',
      module: 'attendance',
      entity: 'LeaveType',
      entityId: saved.id,
      newValue: saved,
    });

    return saved;
  }

  async getLeaveTypes(schoolId: string): Promise<LeaveType[]> {
    return this.leaveTypeRepo.find({
      where: { schoolId, deletedAt: IsNull() },
      order: { name: 'ASC' },
    });
  }

  async updateLeaveType(tenantId: string, schoolId: string, id: string, dto: UpdateLeaveTypeDto, userId?: string): Promise<LeaveType> {
    const type = await this.leaveTypeRepo.findOne({
      where: { id, schoolId, deletedAt: IsNull() },
    });
    if (!type) throw new NotFoundException(`Leave type '${id}' not found`);

    const oldValue = { ...type };
    Object.assign(type, { ...dto, updatedBy: userId });

    const saved = await this.leaveTypeRepo.save(type);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId,
      action: 'UPDATE',
      module: 'attendance',
      entity: 'LeaveType',
      entityId: saved.id,
      oldValue,
      newValue: saved,
    });

    return saved;
  }

  // ===================== LEAVE REQUESTS =====================

  async createLeaveRequest(tenantId: string, schoolId: string, applicantUserId: string, dto: CreateLeaveRequestDto): Promise<LeaveRequest> {
    const request = this.leaveRequestRepo.create({
      ...dto,
      tenantId,
      schoolId,
      applicantUserId,
      createdBy: applicantUserId,
      updatedBy: applicantUserId,
    });

    const saved = await this.leaveRequestRepo.save(request);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId: applicantUserId,
      action: 'CREATE',
      module: 'attendance',
      entity: 'LeaveRequest',
      entityId: saved.id,
      newValue: saved,
    });

    return saved;
  }

  async getLeaveRequests(schoolId: string, query: LeaveRequestQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const qb = this.leaveRequestRepo
      .createQueryBuilder('req')
      .leftJoinAndSelect('req.applicantUser', 'user')
      .leftJoinAndSelect('req.leaveType', 'leaveType')
      .leftJoinAndSelect('req.staff', 'staff')
      .leftJoinAndSelect('req.student', 'student')
      .where('req.school_id = :schoolId', { schoolId })
      .andWhere('req.deleted_at IS NULL');

    if (query.staffId) {
      qb.andWhere('req.staff_id = :staffId', { staffId: query.staffId });
    }

    if (query.studentId) {
      qb.andWhere('req.student_id = :studentId', { studentId: query.studentId });
    }

    if (query.status) {
      qb.andWhere('req.status = :status', { status: query.status });
    }

    qb.orderBy('req.created_at', 'DESC');
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async reviewLeaveRequest(
    tenantId: string,
    schoolId: string,
    id: string,
    dto: ReviewLeaveRequestDto,
    reviewerId: string,
  ): Promise<LeaveRequest> {
    const req = await this.leaveRequestRepo.findOne({
      where: { id, schoolId, deletedAt: IsNull() },
    });
    if (!req) throw new NotFoundException(`Leave request '${id}' not found`);

    const oldValue = { ...req };

    req.status = dto.status;
    req.rejectionReason = dto.rejectionReason;
    req.approvedBy = reviewerId;
    req.approvedAt = new Date();
    req.updatedBy = reviewerId;

    const saved = await this.leaveRequestRepo.save(req);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId: reviewerId,
      action: 'UPDATE',
      module: 'attendance',
      entity: 'LeaveRequest',
      entityId: saved.id,
      oldValue,
      newValue: saved,
    });

    return saved;
  }
}
