import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { StaffDocument } from './entities/staff-document.entity';
import { CreateStaffDocumentDto, VerifyStaffDocumentDto } from './dto/staff-document.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class StaffDocumentsService {
  constructor(
    @InjectRepository(StaffDocument)
    private readonly staffDocRepository: Repository<StaffDocument>,
    private readonly auditService: AuditService,
  ) {}

  async create(tenantId: string, schoolId: string, createDto: CreateStaffDocumentDto, userId?: string): Promise<StaffDocument> {
    const doc = this.staffDocRepository.create({
      ...createDto,
      tenantId,
      schoolId,
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.staffDocRepository.save(doc);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId,
      action: 'CREATE',
      module: 'staff',
      entity: 'StaffDocument',
      entityId: saved.id,
      newValue: saved,
    });

    return saved;
  }

  async findByStaff(schoolId: string, staffId: string): Promise<StaffDocument[]> {
    return this.staffDocRepository.find({
      where: { staffId, schoolId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async verifyDocument(tenantId: string, schoolId: string, id: string, verifyDto: VerifyStaffDocumentDto, userId?: string): Promise<StaffDocument> {
    const doc = await this.staffDocRepository.findOne({
      where: { id, schoolId, deletedAt: IsNull() },
    });

    if (!doc) {
      throw new NotFoundException(`Staff document with ID '${id}' not found`);
    }

    const oldValue = { ...doc };

    doc.isVerified = verifyDto.isVerified;
    doc.verifiedAt = verifyDto.isVerified ? new Date() : undefined;
    doc.verifiedBy = verifyDto.isVerified ? userId : undefined;
    doc.updatedBy = userId;

    const saved = await this.staffDocRepository.save(doc);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId,
      action: 'UPDATE',
      module: 'staff',
      entity: 'StaffDocument',
      entityId: saved.id,
      oldValue,
      newValue: saved,
    });

    return saved;
  }

  async remove(tenantId: string, schoolId: string, id: string, userId?: string): Promise<void> {
    const doc = await this.staffDocRepository.findOne({
      where: { id, schoolId, deletedAt: IsNull() },
    });

    if (!doc) {
      throw new NotFoundException(`Staff document with ID '${id}' not found`);
    }

    doc.deletedAt = new Date();
    doc.updatedBy = userId;
    await this.staffDocRepository.save(doc);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId,
      action: 'DELETE',
      module: 'staff',
      entity: 'StaffDocument',
      entityId: id,
    });
  }
}
