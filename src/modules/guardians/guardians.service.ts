import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guardian } from './entities/guardian.entity';
import { StudentGuardian } from './entities/student-guardian.entity';
import { Student } from '../students/entities/student.entity';
import { AuditService } from '../audit/audit.service';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';
import { LinkGuardianDto } from './dto/link-guardian.dto';

@Injectable()
export class GuardiansService {
  private readonly logger = new Logger(GuardiansService.name);

  constructor(
    @InjectRepository(Guardian)
    private readonly guardianRepo: Repository<Guardian>,
    @InjectRepository(StudentGuardian)
    private readonly studentGuardianRepo: Repository<StudentGuardian>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    private readonly auditService: AuditService,
  ) {}

  async create(
    tenantId: string,
    schoolId: string,
    defaultBranchId: string,
    dto: CreateGuardianDto,
    userId?: string,
  ): Promise<Guardian> {
    const branchId = dto.branchId || defaultBranchId;

    const guardian = this.guardianRepo.create({
      ...dto,
      tenantId,
      schoolId,
      branchId,
      createdBy: userId,
    });

    const saved = await this.guardianRepo.save(guardian);

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId,
      userId,
      module: 'guardian',
      entity: 'Guardian',
      entityId: saved.id,
      action: 'CREATE',
      newValue: saved,
    });

    return saved;
  }

  async findAll(tenantId: string, schoolId: string, search?: string) {
    const qb = this.guardianRepo
      .createQueryBuilder('guardian')
      .leftJoinAndSelect('guardian.students', 'studentGuardian')
      .leftJoinAndSelect('studentGuardian.student', 'student')
      .where('guardian.schoolId = :schoolId', { schoolId })
      .andWhere('guardian.deletedAt IS NULL');

    if (search) {
      qb.andWhere(
        '(LOWER(guardian.firstName) LIKE LOWER(:search) OR LOWER(guardian.lastName) LIKE LOWER(:search) OR guardian.mobile LIKE :search OR LOWER(guardian.email) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('guardian.createdAt', 'DESC');

    return qb.getMany();
  }

  async findOne(tenantId: string, schoolId: string, id: string): Promise<Guardian> {
    const guardian = await this.guardianRepo
      .createQueryBuilder('guardian')
      .leftJoinAndSelect('guardian.students', 'studentGuardian')
      .leftJoinAndSelect('studentGuardian.student', 'student')
      .where('guardian.id = :id', { id })
      .andWhere('guardian.schoolId = :schoolId', { schoolId })
      .andWhere('guardian.deletedAt IS NULL')
      .getOne();

    if (!guardian) {
      throw new NotFoundException(`Guardian with ID ${id} not found.`);
    }

    return guardian;
  }

  async update(
    tenantId: string,
    schoolId: string,
    id: string,
    dto: UpdateGuardianDto,
    userId?: string,
  ): Promise<Guardian> {
    const guardian = await this.findOne(tenantId, schoolId, id);
    const oldState = { ...guardian };

    Object.assign(guardian, dto, { updatedBy: userId });
    const saved = await this.guardianRepo.save(guardian);

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId: guardian.branchId,
      userId,
      module: 'guardian',
      entity: 'Guardian',
      entityId: id,
      action: 'UPDATE',
      oldValue: oldState,
      newValue: saved,
    });

    return saved;
  }

  async remove(tenantId: string, schoolId: string, id: string, userId?: string): Promise<void> {
    const guardian = await this.findOne(tenantId, schoolId, id);
    await this.guardianRepo.softDelete(id);

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId: guardian.branchId,
      userId,
      module: 'guardian',
      entity: 'Guardian',
      entityId: id,
      action: 'DELETE',
      oldValue: guardian,
    });
  }

  async linkGuardianToStudent(
    tenantId: string,
    schoolId: string,
    branchId: string,
    studentId: string,
    dto: LinkGuardianDto,
    userId?: string,
  ): Promise<StudentGuardian> {
    const student = await this.studentRepo.findOne({
      where: { id: studentId, schoolId, deletedAt: undefined },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found.`);
    }

    const guardian = await this.guardianRepo.findOne({
      where: { id: dto.guardianId, schoolId, deletedAt: undefined },
    });
    if (!guardian) {
      throw new NotFoundException(`Guardian with ID ${dto.guardianId} not found.`);
    }

    const existing = await this.studentGuardianRepo.findOne({
      where: { studentId, guardianId: dto.guardianId },
    });
    if (existing) {
      throw new ConflictException('Guardian is already linked to this student.');
    }

    if (dto.isPrimary) {
      // Unset existing primary flags for this student
      await this.studentGuardianRepo.update(
        { studentId, isPrimary: true },
        { isPrimary: false },
      );
    }

    const link = this.studentGuardianRepo.create({
      tenantId,
      schoolId,
      branchId: student.branchId || branchId,
      studentId,
      guardianId: dto.guardianId,
      relationshipType: dto.relationshipType,
      isPrimary: dto.isPrimary ?? false,
      isEmergencyContact: dto.isEmergencyContact ?? false,
      canPickupStudent: dto.canPickupStudent ?? false,
      receivesNotifications: dto.receivesNotifications ?? true,
      hasPortalAccess: dto.hasPortalAccess ?? false,
    });

    const saved = await this.studentGuardianRepo.save(link);

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId: student.branchId || branchId,
      userId,
      module: 'guardian',
      entity: 'StudentGuardian',
      entityId: saved.id,
      action: 'LINK',
      newValue: saved,
    });

    return saved;
  }

  async updateStudentGuardianLink(
    tenantId: string,
    schoolId: string,
    studentId: string,
    guardianId: string,
    dto: Partial<LinkGuardianDto>,
    userId?: string,
  ): Promise<StudentGuardian> {
    const link = await this.studentGuardianRepo.findOne({
      where: { studentId, guardianId, schoolId },
    });
    if (!link) {
      throw new NotFoundException('Guardian link not found for this student.');
    }

    if (dto.isPrimary) {
      await this.studentGuardianRepo.update(
        { studentId, isPrimary: true },
        { isPrimary: false },
      );
    }

    Object.assign(link, dto);
    const saved = await this.studentGuardianRepo.save(link);

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId: link.branchId,
      userId,
      module: 'guardian',
      entity: 'StudentGuardian',
      entityId: saved.id,
      action: 'UPDATE_LINK',
      newValue: saved,
    });

    return saved;
  }

  async unlinkGuardianFromStudent(
    tenantId: string,
    schoolId: string,
    studentId: string,
    guardianId: string,
    userId?: string,
  ): Promise<void> {
    const link = await this.studentGuardianRepo.findOne({
      where: { studentId, guardianId, schoolId },
    });
    if (!link) {
      throw new NotFoundException('Guardian link not found.');
    }

    await this.studentGuardianRepo.delete({ studentId, guardianId });

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId: link.branchId,
      userId,
      module: 'guardian',
      entity: 'StudentGuardian',
      entityId: link.id,
      action: 'UNLINK',
      oldValue: link,
    });
  }
}
