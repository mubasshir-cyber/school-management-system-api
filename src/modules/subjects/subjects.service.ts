import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './entities/subject.entity';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subject.dto';
import { AuditService } from '../audit/audit.service';
import { TenantContext } from '../../common/context/tenant-context';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,
    private readonly auditService: AuditService,
  ) {}

  async create(
    tenantId: string,
    schoolId: string,
    dto: CreateSubjectDto,
  ): Promise<Subject> {
    const existing = await this.subjectRepo.findOne({
      where: { schoolId, code: dto.code },
    });

    if (existing) {
      throw new ConflictException(
        `Subject with code ${dto.code} already exists in this school`,
      );
    }

    const subject = this.subjectRepo.create({
      ...dto,
      tenantId,
      schoolId,
    });

    const saved = await this.subjectRepo.save(subject);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId: TenantContext.getUserId(),
      action: 'CREATE',
      module: 'academic',
      entity: 'Subject',
      entityId: saved.id,
      newValue: saved,
    });

    return saved;
  }

  async findAll(schoolId: string): Promise<Subject[]> {
    return this.subjectRepo.find({
      where: { schoolId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Subject> {
    const subject = await this.subjectRepo.findOne({ where: { id } });
    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }
    return subject;
  }

  async update(id: string, dto: UpdateSubjectDto): Promise<Subject> {
    const subject = await this.findOne(id);
    const oldValue = { ...subject };

    Object.assign(subject, dto);
    const updated = await this.subjectRepo.save(subject);

    await this.auditService.log({
      tenantId: updated.tenantId,
      schoolId: updated.schoolId,
      userId: TenantContext.getUserId(),
      action: 'UPDATE',
      module: 'academic',
      entity: 'Subject',
      entityId: updated.id,
      oldValue,
      newValue: updated,
    });

    return updated;
  }

  async remove(id: string): Promise<void> {
    const subject = await this.findOne(id);
    await this.subjectRepo.softDelete(id);

    await this.auditService.log({
      tenantId: subject.tenantId,
      schoolId: subject.schoolId,
      userId: TenantContext.getUserId(),
      action: 'DELETE',
      module: 'academic',
      entity: 'Subject',
      entityId: id,
    });
  }
}
