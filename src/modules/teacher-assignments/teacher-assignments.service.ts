import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherClassAssignment } from './entities/teacher-class-assignment.entity';
import { TeacherSubjectAssignment } from './entities/teacher-subject-assignment.entity';
import { AssignTeacherToClassDto, AssignTeacherToSubjectDto } from './dto/teacher-assignment.dto';
import { AuditService } from '../audit/audit.service';
import { TenantContext } from '../../common/context/tenant-context';

@Injectable()
export class TeacherAssignmentsService {
  constructor(
    @InjectRepository(TeacherClassAssignment)
    private readonly teacherClassRepo: Repository<TeacherClassAssignment>,
    @InjectRepository(TeacherSubjectAssignment)
    private readonly teacherSubjectRepo: Repository<TeacherSubjectAssignment>,
    private readonly auditService: AuditService,
  ) {}

  // ---------------- CLASS ASSIGNMENTS ----------------
  async assignToClass(
    tenantId: string,
    schoolId: string,
    dto: AssignTeacherToClassDto,
  ): Promise<TeacherClassAssignment> {
    const existing = await this.teacherClassRepo.findOne({
      where: {
        academicYearId: dto.academicYearId,
        sectionId: dto.sectionId,
        teacherId: dto.teacherId,
      },
    });

    if (existing) {
      throw new ConflictException(
        'This teacher is already assigned to the selected class section for this academic year',
      );
    }

    const assignment = this.teacherClassRepo.create({
      ...dto,
      tenantId,
      schoolId,
    });

    const saved = await this.teacherClassRepo.save(assignment);

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId: saved.branchId,
      userId: TenantContext.getUserId(),
      action: 'ASSIGN_TEACHER_CLASS',
      module: 'academic',
      entity: 'TeacherClassAssignment',
      entityId: saved.id,
      newValue: saved,
    });

    return this.findClassAssignmentById(saved.id);
  }

  async findClassAssignments(
    schoolId: string,
    teacherId?: string,
    academicYearId?: string,
  ): Promise<TeacherClassAssignment[]> {
    const where: any = { schoolId };
    if (teacherId) where.teacherId = teacherId;
    if (academicYearId) where.academicYearId = academicYearId;

    return this.teacherClassRepo.find({
      where,
      relations: {
        teacher: true,
        class: true,
        section: true,
        academicYear: true,
      },
    });
  }

  async findClassAssignmentById(id: string): Promise<TeacherClassAssignment> {
    const item = await this.teacherClassRepo.findOne({
      where: { id },
      relations: {
        teacher: true,
        class: true,
        section: true,
        academicYear: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Teacher class assignment with ID ${id} not found`);
    }

    return item;
  }

  async removeClassAssignment(id: string): Promise<void> {
    const item = await this.findClassAssignmentById(id);
    await this.teacherClassRepo.delete(id);

    await this.auditService.log({
      tenantId: item.tenantId,
      schoolId: item.schoolId,
      userId: TenantContext.getUserId(),
      action: 'UNASSIGN_TEACHER_CLASS',
      module: 'academic',
      entity: 'TeacherClassAssignment',
      entityId: id,
    });
  }

  // ---------------- SUBJECT ASSIGNMENTS ----------------
  async assignToSubject(
    tenantId: string,
    schoolId: string,
    dto: AssignTeacherToSubjectDto,
  ): Promise<TeacherSubjectAssignment> {
    const existing = await this.teacherSubjectRepo.findOne({
      where: {
        academicYearId: dto.academicYearId,
        sectionId: dto.sectionId,
        subjectId: dto.subjectId,
        teacherId: dto.teacherId,
      },
    });

    if (existing) {
      throw new ConflictException(
        'This teacher is already assigned to this subject for this section',
      );
    }

    const assignment = this.teacherSubjectRepo.create({
      ...dto,
      tenantId,
      schoolId,
    });

    const saved = await this.teacherSubjectRepo.save(assignment);

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId: saved.branchId,
      userId: TenantContext.getUserId(),
      action: 'ASSIGN_TEACHER_SUBJECT',
      module: 'academic',
      entity: 'TeacherSubjectAssignment',
      entityId: saved.id,
      newValue: saved,
    });

    return this.findSubjectAssignmentById(saved.id);
  }

  async findSubjectAssignments(
    schoolId: string,
    teacherId?: string,
    academicYearId?: string,
  ): Promise<TeacherSubjectAssignment[]> {
    const where: any = { schoolId };
    if (teacherId) where.teacherId = teacherId;
    if (academicYearId) where.academicYearId = academicYearId;

    return this.teacherSubjectRepo.find({
      where,
      relations: {
        teacher: true,
        class: true,
        section: true,
        subject: true,
        academicYear: true,
      },
    });
  }

  async findSubjectAssignmentById(id: string): Promise<TeacherSubjectAssignment> {
    const item = await this.teacherSubjectRepo.findOne({
      where: { id },
      relations: {
        teacher: true,
        class: true,
        section: true,
        subject: true,
        academicYear: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Teacher subject assignment with ID ${id} not found`);
    }

    return item;
  }

  async removeSubjectAssignment(id: string): Promise<void> {
    const item = await this.findSubjectAssignmentById(id);
    await this.teacherSubjectRepo.delete(id);

    await this.auditService.log({
      tenantId: item.tenantId,
      schoolId: item.schoolId,
      userId: TenantContext.getUserId(),
      action: 'UNASSIGN_TEACHER_SUBJECT',
      module: 'academic',
      entity: 'TeacherSubjectAssignment',
      entityId: id,
    });
  }
}
