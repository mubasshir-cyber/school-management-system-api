import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from './entities/section.entity';
import { CreateSectionDto, UpdateSectionDto } from './dto/section.dto';
import { AuditService } from '../audit/audit.service';
import { TenantContext } from '../../common/context/tenant-context';

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepo: Repository<Section>,
    private readonly auditService: AuditService,
  ) {}

  async create(
    tenantId: string,
    schoolId: string,
    dto: CreateSectionDto,
  ): Promise<Section> {
    const existing = await this.sectionRepo.findOne({
      where: {
        classId: dto.classId,
        code: dto.code,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Section with code ${dto.code} already exists in this class`,
      );
    }

    const section = this.sectionRepo.create({
      ...dto,
      tenantId,
      schoolId,
    });

    const saved = await this.sectionRepo.save(section);

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId: saved.branchId,
      userId: TenantContext.getUserId(),
      action: 'CREATE',
      module: 'academic',
      entity: 'Section',
      entityId: saved.id,
      newValue: saved,
    });

    return this.findOne(saved.id);
  }

  async findAll(schoolId: string, classId?: string, academicYearId?: string): Promise<Section[]> {
    const where: any = { schoolId };
    if (classId) where.classId = classId;
    if (academicYearId) where.academicYearId = academicYearId;

    return this.sectionRepo.find({
      where,
      order: { name: 'ASC' },
      relations: {
        class: true,
        classTeacher: true,
        academicYear: true,
      },
    });
  }

  async findOne(id: string): Promise<Section> {
    const section = await this.sectionRepo.findOne({
      where: { id },
      relations: {
        class: true,
        classTeacher: true,
        academicYear: true,
      },
    });

    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    return section;
  }

  async update(id: string, dto: UpdateSectionDto): Promise<Section> {
    const section = await this.findOne(id);
    const oldValue = { ...section };

    Object.assign(section, dto);
    const updated = await this.sectionRepo.save(section);

    await this.auditService.log({
      tenantId: updated.tenantId,
      schoolId: updated.schoolId,
      branchId: updated.branchId,
      userId: TenantContext.getUserId(),
      action: 'UPDATE',
      module: 'academic',
      entity: 'Section',
      entityId: updated.id,
      oldValue,
      newValue: updated,
    });

    return this.findOne(updated.id);
  }

  async remove(id: string): Promise<void> {
    const section = await this.findOne(id);
    await this.sectionRepo.softDelete(id);

    await this.auditService.log({
      tenantId: section.tenantId,
      schoolId: section.schoolId,
      branchId: section.branchId,
      userId: TenantContext.getUserId(),
      action: 'DELETE',
      module: 'academic',
      entity: 'Section',
      entityId: id,
    });
  }
}
