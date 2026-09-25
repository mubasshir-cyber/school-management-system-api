import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ClassSubject } from './entities/class-subject.entity';
import { AssignSubjectToClassDto, BulkAssignSubjectsDto } from './dto/class-subject.dto';
import { AuditService } from '../audit/audit.service';
import { TenantContext } from '../../common/context/tenant-context';

@Injectable()
export class ClassSubjectsService {
  constructor(
    @InjectRepository(ClassSubject)
    private readonly classSubjectRepo: Repository<ClassSubject>,
    private readonly auditService: AuditService,
  ) {}

  async assignSubject(
    tenantId: string,
    schoolId: string,
    dto: AssignSubjectToClassDto,
  ): Promise<ClassSubject> {
    const existing = await this.classSubjectRepo.findOne({
      where: {
        classId: dto.classId,
        subjectId: dto.subjectId,
      },
    });

    if (existing) {
      throw new ConflictException(
        'This subject is already assigned to the selected class',
      );
    }

    const mapping = this.classSubjectRepo.create({
      ...dto,
      tenantId,
      schoolId,
    });

    const saved = await this.classSubjectRepo.save(mapping);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId: TenantContext.getUserId(),
      action: 'ASSIGN_SUBJECT',
      module: 'academic',
      entity: 'ClassSubject',
      entityId: saved.id,
      newValue: saved,
    });

    return this.findOne(saved.id);
  }

  async bulkAssign(
    tenantId: string,
    schoolId: string,
    dto: BulkAssignSubjectsDto,
  ): Promise<ClassSubject[]> {
    const results: ClassSubject[] = [];

    for (const subjectId of dto.subjectIds) {
      const existing = await this.classSubjectRepo.findOne({
        where: {
          classId: dto.classId,
          subjectId,
        },
      });

      if (!existing) {
        const item = this.classSubjectRepo.create({
          tenantId,
          schoolId,
          academicYearId: dto.academicYearId,
          classId: dto.classId,
          subjectId,
        });
        const saved = await this.classSubjectRepo.save(item);
        results.push(saved);
      }
    }

    await this.auditService.log({
      tenantId,
      schoolId,
      userId: TenantContext.getUserId(),
      action: 'BULK_ASSIGN_SUBJECTS',
      module: 'academic',
      entity: 'ClassSubject',
      newValue: dto,
    });

    return this.findByClass(dto.classId);
  }

  async findByClass(classId: string): Promise<ClassSubject[]> {
    return this.classSubjectRepo.find({
      where: { classId },
      order: { displayOrder: 'ASC' },
      relations: {
        subject: true,
        class: true,
      },
    });
  }

  async findOne(id: string): Promise<ClassSubject> {
    const item = await this.classSubjectRepo.findOne({
      where: { id },
      relations: {
        subject: true,
        class: true,
        academicYear: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Class-subject mapping with ID ${id} not found`);
    }

    return item;
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.classSubjectRepo.delete(id);

    await this.auditService.log({
      tenantId: item.tenantId,
      schoolId: item.schoolId,
      userId: TenantContext.getUserId(),
      action: 'UNASSIGN_SUBJECT',
      module: 'academic',
      entity: 'ClassSubject',
      entityId: id,
    });
  }
}
