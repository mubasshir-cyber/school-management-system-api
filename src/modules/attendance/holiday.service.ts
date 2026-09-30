import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Holiday } from './entities/holiday.entity';
import { CreateHolidayDto, UpdateHolidayDto } from './dto/holiday.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class HolidayService {
  constructor(
    @InjectRepository(Holiday)
    private readonly holidayRepo: Repository<Holiday>,
    private readonly auditService: AuditService,
  ) {}

  async create(tenantId: string, schoolId: string, dto: CreateHolidayDto, userId?: string): Promise<Holiday> {
    const holiday = this.holidayRepo.create({
      ...dto,
      tenantId,
      schoolId,
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.holidayRepo.save(holiday);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId,
      action: 'CREATE',
      module: 'attendance',
      entity: 'Holiday',
      entityId: saved.id,
      newValue: saved,
    });

    return saved;
  }

  async findAll(schoolId: string, academicYearId?: string): Promise<Holiday[]> {
    const where: any = { schoolId, deletedAt: IsNull() };
    if (academicYearId) where.academicYearId = academicYearId;

    return this.holidayRepo.find({
      where,
      order: { startDate: 'ASC' },
    });
  }

  async findOne(schoolId: string, id: string): Promise<Holiday> {
    const holiday = await this.holidayRepo.findOne({
      where: { id, schoolId, deletedAt: IsNull() },
    });
    if (!holiday) throw new NotFoundException(`Holiday '${id}' not found`);
    return holiday;
  }

  async update(tenantId: string, schoolId: string, id: string, dto: UpdateHolidayDto, userId?: string): Promise<Holiday> {
    const holiday = await this.findOne(schoolId, id);
    const oldValue = { ...holiday };

    Object.assign(holiday, { ...dto, updatedBy: userId });

    const saved = await this.holidayRepo.save(holiday);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId,
      action: 'UPDATE',
      module: 'attendance',
      entity: 'Holiday',
      entityId: saved.id,
      oldValue,
      newValue: saved,
    });

    return saved;
  }

  async remove(tenantId: string, schoolId: string, id: string, userId?: string): Promise<void> {
    const holiday = await this.findOne(schoolId, id);
    holiday.deletedAt = new Date();
    holiday.updatedBy = userId;
    await this.holidayRepo.save(holiday);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId,
      action: 'DELETE',
      module: 'attendance',
      entity: 'Holiday',
      entityId: id,
    });
  }
}
