import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StudentEnrollment } from './entities/student-enrollment.entity';
import { Student } from '../students/entities/student.entity';
import { AuditService } from '../audit/audit.service';
import { CreateEnrollmentDto, UpdateEnrollmentDto, TransferEnrollmentDto } from './dto/create-enrollment.dto';
import { EnrollmentStatus, StudentStatus } from '../../common/enums/status.enum';

@Injectable()
export class EnrollmentsService {
  private readonly logger = new Logger(EnrollmentsService.name);

  constructor(
    @InjectRepository(StudentEnrollment)
    private readonly enrollmentRepo: Repository<StudentEnrollment>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    tenantId: string,
    schoolId: string,
    defaultBranchId: string,
    dto: CreateEnrollmentDto,
    userId?: string,
  ): Promise<StudentEnrollment> {
    const branchId = dto.branchId || defaultBranchId;

    const student = await this.studentRepo.findOne({
      where: { id: dto.studentId, schoolId, deletedAt: undefined },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${dto.studentId} not found.`);
    }

    // Check for existing active enrollment in the same academic year
    const existing = await this.enrollmentRepo.findOne({
      where: {
        studentId: dto.studentId,
        academicYearId: dto.academicYearId,
        schoolId,
        status: EnrollmentStatus.ACTIVE,
      },
    });
    if (existing) {
      throw new ConflictException(
        'Student already has an active enrollment for this academic year.',
      );
    }

    const enrollment = this.enrollmentRepo.create({
      ...dto,
      tenantId,
      schoolId,
      branchId,
      status: dto.status || EnrollmentStatus.ACTIVE,
      startDate: dto.startDate || new Date().toISOString().split('T')[0],
      createdBy: userId,
    });

    const saved = await this.enrollmentRepo.save(enrollment);

    // If student status was REGISTERED, set to ACTIVE
    if (student.status === StudentStatus.REGISTERED) {
      student.status = StudentStatus.ACTIVE;
      await this.studentRepo.save(student);
    }

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId,
      userId,
      module: 'enrollment',
      entity: 'StudentEnrollment',
      entityId: saved.id,
      action: 'CREATE',
      newValue: saved,
    });

    return saved;
  }

  async findAll(
    tenantId: string,
    schoolId: string,
    options?: {
      academicYearId?: string;
      classId?: string;
      sectionId?: string;
      status?: EnrollmentStatus;
    },
  ) {
    const qb = this.enrollmentRepo
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('enrollment.academicYear', 'academicYear')
      .leftJoinAndSelect('enrollment.class', 'class')
      .leftJoinAndSelect('enrollment.section', 'section')
      .where('enrollment.schoolId = :schoolId', { schoolId })
      .andWhere('enrollment.deletedAt IS NULL');

    if (options?.academicYearId) {
      qb.andWhere('enrollment.academicYearId = :academicYearId', {
        academicYearId: options.academicYearId,
      });
    }

    if (options?.classId) {
      qb.andWhere('enrollment.classId = :classId', { classId: options.classId });
    }

    if (options?.sectionId) {
      qb.andWhere('enrollment.sectionId = :sectionId', { sectionId: options.sectionId });
    }

    if (options?.status) {
      qb.andWhere('enrollment.status = :status', { status: options.status });
    }

    qb.orderBy('enrollment.rollNumber', 'ASC');

    return qb.getMany();
  }

  async findOne(tenantId: string, schoolId: string, id: string): Promise<StudentEnrollment> {
    const enrollment = await this.enrollmentRepo
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.student', 'student')
      .leftJoinAndSelect('enrollment.academicYear', 'academicYear')
      .leftJoinAndSelect('enrollment.class', 'class')
      .leftJoinAndSelect('enrollment.section', 'section')
      .where('enrollment.id = :id', { id })
      .andWhere('enrollment.schoolId = :schoolId', { schoolId })
      .andWhere('enrollment.deletedAt IS NULL')
      .getOne();

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found.`);
    }

    return enrollment;
  }

  async findByStudent(tenantId: string, schoolId: string, studentId: string): Promise<StudentEnrollment[]> {
    return this.enrollmentRepo
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.academicYear', 'academicYear')
      .leftJoinAndSelect('enrollment.class', 'class')
      .leftJoinAndSelect('enrollment.section', 'section')
      .where('enrollment.studentId = :studentId', { studentId })
      .andWhere('enrollment.schoolId = :schoolId', { schoolId })
      .andWhere('enrollment.deletedAt IS NULL')
      .orderBy('academicYear.startDate', 'DESC')
      .getMany();
  }

  async update(
    tenantId: string,
    schoolId: string,
    id: string,
    dto: UpdateEnrollmentDto,
    userId?: string,
  ): Promise<StudentEnrollment> {
    const enrollment = await this.findOne(tenantId, schoolId, id);
    const oldState = { ...enrollment };

    Object.assign(enrollment, dto, { updatedBy: userId });
    const saved = await this.enrollmentRepo.save(enrollment);

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId: enrollment.branchId,
      userId,
      module: 'enrollment',
      entity: 'StudentEnrollment',
      entityId: id,
      action: 'UPDATE',
      oldValue: oldState,
      newValue: saved,
    });

    return saved;
  }

  async transfer(
    tenantId: string,
    schoolId: string,
    id: string,
    dto: TransferEnrollmentDto,
    userId?: string,
  ): Promise<StudentEnrollment> {
    const currentEnrollment = await this.findOne(tenantId, schoolId, id);

    return this.dataSource.transaction(async (manager) => {
      // 1. Close current enrollment
      currentEnrollment.status = EnrollmentStatus.TRANSFERRED;
      currentEnrollment.endDate = new Date().toISOString().split('T')[0];
      currentEnrollment.updatedBy = userId;
      await manager.save(StudentEnrollment, currentEnrollment);

      // 2. Create new active enrollment
      const newEnrollment = manager.create(StudentEnrollment, {
        tenantId,
        schoolId,
        branchId: currentEnrollment.branchId,
        studentId: currentEnrollment.studentId,
        academicYearId: currentEnrollment.academicYearId,
        classId: dto.targetClassId,
        sectionId: dto.targetSectionId,
        rollNumber: dto.newRollNumber || currentEnrollment.rollNumber,
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: EnrollmentStatus.ACTIVE,
        startDate: new Date().toISOString().split('T')[0],
        createdBy: userId,
      });

      const saved = await manager.save(StudentEnrollment, newEnrollment);

      await this.auditService.log({
        tenantId,
        schoolId,
        branchId: currentEnrollment.branchId,
        userId,
        module: 'enrollment',
        entity: 'StudentEnrollment',
        entityId: id,
        action: 'TRANSFER',
        newValue: {
          fromEnrollmentId: id,
          toEnrollmentId: saved.id,
          targetClassId: dto.targetClassId,
          targetSectionId: dto.targetSectionId,
        },
      });

      return saved;
    });
  }

  async withdraw(
    tenantId: string,
    schoolId: string,
    id: string,
    reason?: string,
    userId?: string,
  ): Promise<StudentEnrollment> {
    const enrollment = await this.findOne(tenantId, schoolId, id);

    enrollment.status = EnrollmentStatus.WITHDRAWN;
    enrollment.endDate = new Date().toISOString().split('T')[0];
    enrollment.promotionStatus = reason || 'Withdrawn';
    enrollment.updatedBy = userId;

    const saved = await this.enrollmentRepo.save(enrollment);

    // Update student status
    await this.studentRepo.update(
      { id: enrollment.studentId },
      { status: StudentStatus.WITHDRAWN },
    );

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId: enrollment.branchId,
      userId,
      module: 'enrollment',
      entity: 'StudentEnrollment',
      entityId: id,
      action: 'WITHDRAW',
      newValue: saved,
    });

    return saved;
  }
}
