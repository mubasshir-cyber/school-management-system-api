import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassEntity } from './entities/class.entity';
import { CreateClassDto, UpdateClassDto } from './dto/class.dto';
import { AuditService } from '../audit/audit.service';
import { TenantContext } from '../../common/context/tenant-context';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepo: Repository<ClassEntity>,
    private readonly auditService: AuditService,
  ) {}

  async create(
    tenantId: string,
    schoolId: string,
    dto: CreateClassDto,
  ): Promise<ClassEntity> {
    const existing = await this.classRepo.findOne({
      where: {
        schoolId,
        academicYearId: dto.academicYearId,
        code: dto.code,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Class with code ${dto.code} already exists for this academic year`,
      );
    }

    const newClass = this.classRepo.create({
      ...dto,
      tenantId,
      schoolId,
    });

    const saved = await this.classRepo.save(newClass);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId: TenantContext.getUserId(),
      action: 'CREATE',
      module: 'academic',
      entity: 'Class',
      entityId: saved.id,
      newValue: saved,
    });

    return saved;
  }

  async findAll(schoolId: string, academicYearId?: string): Promise<ClassEntity[]> {
    const where: any = { schoolId };
    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    return this.classRepo.find({
      where,
      order: { level: 'ASC', displayOrder: 'ASC' },
      relations: {
        academicYear: true,
      },
    });
  }

  async findOne(id: string): Promise<ClassEntity> {
    const classItem = await this.classRepo.findOne({
      where: { id },
      relations: {
        academicYear: true,
      },
    });

    if (!classItem) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    return classItem;
  }

  async update(id: string, dto: UpdateClassDto): Promise<ClassEntity> {
    const classItem = await this.findOne(id);
    const oldValue = { ...classItem };

    Object.assign(classItem, dto);
    const updated = await this.classRepo.save(classItem);

    await this.auditService.log({
      tenantId: updated.tenantId,
      schoolId: updated.schoolId,
      userId: TenantContext.getUserId(),
      action: 'UPDATE',
      module: 'academic',
      entity: 'Class',
      entityId: updated.id,
      oldValue,
      newValue: updated,
    });

    return updated;
  }

  async remove(id: string): Promise<void> {
    const classItem = await this.findOne(id);
    await this.classRepo.softDelete(id);

    await this.auditService.log({
      tenantId: classItem.tenantId,
      schoolId: classItem.schoolId,
      userId: TenantContext.getUserId(),
      action: 'DELETE',
      module: 'academic',
      entity: 'Class',
      entityId: id,
    });
  }
}
