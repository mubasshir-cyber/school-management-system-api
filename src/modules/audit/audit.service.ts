import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export interface CreateAuditLogDto {
  tenantId?: string;
  schoolId?: string;
  branchId?: string;
  userId?: string;
  userEmail?: string;
  action: string;
  module: string;
  entity: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(dto: CreateAuditLogDto): Promise<AuditLog> {
    try {
      const auditLog = this.auditRepo.create(dto);
      return await this.auditRepo.save(auditLog);
    } catch (err: any) {
      this.logger.error(`Failed to record audit log: ${err.message}`, err.stack);
      throw err;
    }
  }

  async findAll(params: {
    tenantId?: string;
    schoolId?: string;
    module?: string;
    action?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.auditRepo.createQueryBuilder('audit');

    if (params.tenantId) {
      query.andWhere('audit.tenant_id = :tenantId', { tenantId: params.tenantId });
    }
    if (params.schoolId) {
      query.andWhere('audit.school_id = :schoolId', { schoolId: params.schoolId });
    }
    if (params.module) {
      query.andWhere('audit.module = :module', { module: params.module });
    }
    if (params.action) {
      query.andWhere('audit.action = :action', { action: params.action });
    }

    query.orderBy('audit.created_at', 'DESC');
    query.skip(skip).take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
