import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Designation } from './entities/designation.entity';
import { CreateDesignationDto, UpdateDesignationDto } from './dto/designation.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DesignationsService {
  constructor(
    @InjectRepository(Designation)
    private readonly designationRepository: Repository<Designation>,
    private readonly auditService: AuditService,
  ) {}

  async create(tenantId: string, schoolId: string, createDto: CreateDesignationDto, userId?: string): Promise<Designation> {
    const existing = await this.designationRepository.findOne({
      where: { schoolId, code: createDto.code, deletedAt: IsNull() },
    });

    if (existing) {
      throw new ConflictException(`Designation with code '${createDto.code}' already exists`);
    }

    const desig = this.designationRepository.create({
      ...createDto,
      tenantId,
      schoolId,
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.designationRepository.save(desig);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId,
      action: 'CREATE',
      module: 'staff',
      entity: 'Designation',
      entityId: saved.id,
      newValue: saved,
    });

    return saved;
  }

  async findAll(schoolId: string, departmentId?: string): Promise<Designation[]> {
    const where: any = { schoolId, deletedAt: IsNull() };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    return this.designationRepository.find({
      where,
      relations: {
        department: true,
        staffMembers: true,
      },
      order: { level: 'ASC', title: 'ASC' },
    });
  }

  async findOne(schoolId: string, id: string): Promise<Designation> {
    const desig = await this.designationRepository.findOne({
      where: { id, schoolId, deletedAt: IsNull() },
      relations: {
        department: true,
        staffMembers: true,
      },
    });

    if (!desig) {
      throw new NotFoundException(`Designation with ID '${id}' not found`);
    }

    return desig;
  }

  async update(tenantId: string, schoolId: string, id: string, updateDto: UpdateDesignationDto, userId?: string): Promise<Designation> {
    const desig = await this.findOne(schoolId, id);
    const oldValue = { ...desig };

    Object.assign(desig, {
      ...updateDto,
      updatedBy: userId,
    });

    const saved = await this.designationRepository.save(desig);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId,
      action: 'UPDATE',
      module: 'staff',
      entity: 'Designation',
      entityId: saved.id,
      oldValue,
      newValue: saved,
    });

    return saved;
  }

  async remove(tenantId: string, schoolId: string, id: string, userId?: string): Promise<void> {
    const desig = await this.findOne(schoolId, id);
    desig.deletedAt = new Date();
    desig.updatedBy = userId;
    await this.designationRepository.save(desig);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId,
      action: 'DELETE',
      module: 'staff',
      entity: 'Designation',
      entityId: id,
    });
  }
}
