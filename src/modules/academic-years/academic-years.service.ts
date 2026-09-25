import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicYear } from './entities/academic-year.entity';
import { CreateAcademicYearDto, UpdateAcademicYearDto } from './dto/academic-year.dto';
import { AuditService } from '../audit/audit.service';
import { TenantContext } from '../../common/context/tenant-context';
import { CommonStatus } from '../../common/enums/status.enum';

@Injectable()
export class AcademicYearsService {
  constructor(
    @InjectRepository(AcademicYear)
    private readonly academicYearRepo: Repository<AcademicYear>,
    private readonly auditService: AuditService,
  ) {}

  async create(
    tenantId: string,
    schoolId: string,
    dto: CreateAcademicYearDto,
  ): Promise<AcademicYear> {
    if (new Date(dto.startDate) >= new Date(dto.endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    const existing = await this.academicYearRepo.findOne({
      where: { schoolId, code: dto.code },
    });
    if (existing) {
      throw new ConflictException(
        `Academic year with code ${dto.code} already exists for this school`,
      );
    }

    if (dto.isCurrent) {
      await this.academicYearRepo.update({ schoolId }, { isCurrent: false });
    }

    const academicYear = this.academicYearRepo.create({
      ...dto,
      tenantId,
      schoolId,
    });

    const saved = await this.academicYearRepo.save(academicYear);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId: TenantContext.getUserId(),
      action: 'CREATE',
      module: 'academic',
      entity: 'AcademicYear',
      entityId: saved.id,
      newValue: saved,
    });

    return saved;
  }

  async findAll(schoolId: string): Promise<AcademicYear[]> {
    return this.academicYearRepo.find({
      where: { schoolId },
      order: { startDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<AcademicYear> {
    const academicYear = await this.academicYearRepo.findOne({ where: { id } });
    if (!academicYear) {
      throw new NotFoundException(`Academic year with ID ${id} not found`);
    }
    return academicYear;
  }

  async getCurrent(schoolId: string): Promise<AcademicYear | null> {
    return this.academicYearRepo.findOne({
      where: { schoolId, isCurrent: true, status: CommonStatus.ACTIVE },
    });
  }

  async update(id: string, dto: UpdateAcademicYearDto): Promise<AcademicYear> {
    const academicYear = await this.findOne(id);

    if (dto.startDate && dto.endDate && new Date(dto.startDate) >= new Date(dto.endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    const oldValue = { ...academicYear };
    Object.assign(academicYear, dto);

    const updated = await this.academicYearRepo.save(academicYear);

    await this.auditService.log({
      tenantId: updated.tenantId,
      schoolId: updated.schoolId,
      userId: TenantContext.getUserId(),
      action: 'UPDATE',
      module: 'academic',
      entity: 'AcademicYear',
      entityId: updated.id,
      oldValue,
      newValue: updated,
    });

    return updated;
  }

  async setCurrent(id: string): Promise<AcademicYear> {
    const academicYear = await this.findOne(id);

    await this.academicYearRepo.update(
      { schoolId: academicYear.schoolId },
      { isCurrent: false },
    );

    academicYear.isCurrent = true;
    academicYear.status = CommonStatus.ACTIVE;
    const saved = await this.academicYearRepo.save(academicYear);

    await this.auditService.log({
      tenantId: saved.tenantId,
      schoolId: saved.schoolId,
      userId: TenantContext.getUserId(),
      action: 'SET_CURRENT',
      module: 'academic',
      entity: 'AcademicYear',
      entityId: saved.id,
    });

    return saved;
  }

  async closeYear(id: string): Promise<AcademicYear> {
    const academicYear = await this.findOne(id);
    academicYear.isCurrent = false;
    academicYear.status = CommonStatus.ARCHIVED;

    const saved = await this.academicYearRepo.save(academicYear);

    await this.auditService.log({
      tenantId: saved.tenantId,
      schoolId: saved.schoolId,
      userId: TenantContext.getUserId(),
      action: 'CLOSE',
      module: 'academic',
      entity: 'AcademicYear',
      entityId: saved.id,
    });

    return saved;
  }

  async remove(id: string): Promise<void> {
    const academicYear = await this.findOne(id);
    await this.academicYearRepo.softDelete(id);

    await this.auditService.log({
      tenantId: academicYear.tenantId,
      schoolId: academicYear.schoolId,
      userId: TenantContext.getUserId(),
      action: 'DELETE',
      module: 'academic',
      entity: 'AcademicYear',
      entityId: id,
    });
  }
}
