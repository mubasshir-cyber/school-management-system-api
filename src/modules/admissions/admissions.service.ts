import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Admission } from './entities/admission.entity';
import { Student } from '../students/entities/student.entity';
import { Guardian } from '../guardians/entities/guardian.entity';
import { StudentGuardian } from '../guardians/entities/student-guardian.entity';
import { StudentEnrollment } from '../enrollments/entities/student-enrollment.entity';
import { NumberingSequenceService } from '../students/services/numbering-sequence.service';
import { AuditService } from '../audit/audit.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionDto } from './dto/update-admission.dto';
import {
  ReviewAdmissionDto,
  RejectAdmissionDto,
  EnrollAdmissionDto,
} from './dto/review-admission.dto';
import {
  AdmissionStatus,
  EnrollmentStatus,
  GuardianRelationshipType,
  SequenceType,
  StudentStatus,
} from '../../common/enums/status.enum';

@Injectable()
export class AdmissionsService {
  private readonly logger = new Logger(AdmissionsService.name);

  constructor(
    @InjectRepository(Admission)
    private readonly admissionRepo: Repository<Admission>,
    private readonly numberingSequenceService: NumberingSequenceService,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    tenantId: string,
    schoolId: string,
    defaultBranchId: string,
    dto: CreateAdmissionDto,
    userId?: string,
  ): Promise<Admission> {
    const branchId = dto.branchId || defaultBranchId;

    return this.dataSource.transaction(async (manager) => {
      const applicationNumber = await this.numberingSequenceService.getNextSequence(
        tenantId,
        schoolId,
        SequenceType.ADMISSION,
        undefined,
        manager,
      );

      const admission = manager.create(Admission, {
        ...dto,
        tenantId,
        schoolId,
        branchId,
        applicationNumber,
        status: AdmissionStatus.DRAFT,
        createdBy: userId,
      });

      const saved = await manager.save(Admission, admission);

      await this.auditService.log({
        tenantId,
        schoolId,
        branchId,
        userId,
        module: 'admission',
        entity: 'Admission',
        entityId: saved.id,
        action: 'CREATE',
        newValue: saved,
      });

      return saved;
    });
  }

  async findAll(
    tenantId: string,
    schoolId: string,
    options?: {
      status?: AdmissionStatus;
      academicYearId?: string;
      classId?: string;
      search?: string;
    },
  ) {
    const qb = this.admissionRepo
      .createQueryBuilder('admission')
      .leftJoinAndSelect('admission.academicYear', 'academicYear')
      .leftJoinAndSelect('admission.class', 'class')
      .leftJoinAndSelect('admission.preferredSection', 'preferredSection')
      .leftJoinAndSelect('admission.student', 'student')
      .where('admission.schoolId = :schoolId', { schoolId })
      .andWhere('admission.deletedAt IS NULL');

    if (options?.status) {
      qb.andWhere('admission.status = :status', { status: options.status });
    }

    if (options?.academicYearId) {
      qb.andWhere('admission.academicYearId = :academicYearId', {
        academicYearId: options.academicYearId,
      });
    }

    if (options?.classId) {
      qb.andWhere('admission.classId = :classId', { classId: options.classId });
    }

    if (options?.search) {
      qb.andWhere(
        '(LOWER(admission.firstName) LIKE LOWER(:search) OR LOWER(admission.lastName) LIKE LOWER(:search) OR LOWER(admission.applicationNumber) LIKE LOWER(:search) OR admission.guardianMobile LIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    qb.orderBy('admission.createdAt', 'DESC');

    return qb.getMany();
  }

  async findOne(tenantId: string, schoolId: string, id: string): Promise<Admission> {
    const admission = await this.admissionRepo
      .createQueryBuilder('admission')
      .leftJoinAndSelect('admission.academicYear', 'academicYear')
      .leftJoinAndSelect('admission.class', 'class')
      .leftJoinAndSelect('admission.preferredSection', 'preferredSection')
      .leftJoinAndSelect('admission.student', 'student')
      .leftJoinAndSelect('admission.reviewer', 'reviewer')
      .leftJoinAndSelect('admission.approver', 'approver')
      .where('admission.id = :id', { id })
      .andWhere('admission.schoolId = :schoolId', { schoolId })
      .andWhere('admission.deletedAt IS NULL')
      .getOne();

    if (!admission) {
      throw new NotFoundException(`Admission application with ID ${id} not found.`);
    }

    return admission;
  }

  async update(
    tenantId: string,
    schoolId: string,
    id: string,
    dto: UpdateAdmissionDto,
    userId?: string,
  ): Promise<Admission> {
    const admission = await this.findOne(tenantId, schoolId, id);
    if (admission.status === AdmissionStatus.ENROLLED) {
      throw new BadRequestException('Cannot edit an application that has already been enrolled.');
    }

    const oldState = { ...admission };
    Object.assign(admission, dto, { updatedBy: userId });
    const saved = await this.admissionRepo.save(admission);

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId: admission.branchId,
      userId,
      module: 'admission',
      entity: 'Admission',
      entityId: id,
      action: 'UPDATE',
      oldValue: oldState,
      newValue: saved,
    });

    return saved;
  }

  async submit(tenantId: string, schoolId: string, id: string, userId?: string): Promise<Admission> {
    const admission = await this.findOne(tenantId, schoolId, id);
    if (admission.status !== AdmissionStatus.DRAFT) {
      throw new BadRequestException(`Cannot submit application in ${admission.status} state.`);
    }

    admission.status = AdmissionStatus.SUBMITTED;
    admission.updatedBy = userId;
    const saved = await this.admissionRepo.save(admission);

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId: admission.branchId,
      userId,
      module: 'admission',
      entity: 'Admission',
      entityId: id,
      action: 'SUBMIT',
      newValue: saved,
    });

    return saved;
  }

  async review(
    tenantId: string,
    schoolId: string,
    id: string,
    dto: ReviewAdmissionDto,
    userId?: string,
  ): Promise<Admission> {
    const admission = await this.findOne(tenantId, schoolId, id);
    if (
      admission.status !== AdmissionStatus.SUBMITTED &&
      admission.status !== AdmissionStatus.UNDER_REVIEW
    ) {
      throw new BadRequestException(`Cannot mark application as under review from ${admission.status} state.`);
    }

    admission.status = AdmissionStatus.UNDER_REVIEW;
    admission.reviewedBy = userId;
    admission.reviewedAt = new Date();
    if (dto.notes) admission.notes = dto.notes;
    admission.updatedBy = userId;

    const saved = await this.admissionRepo.save(admission);

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId: admission.branchId,
      userId,
      module: 'admission',
      entity: 'Admission',
      entityId: id,
      action: 'REVIEW',
      newValue: saved,
    });

    return saved;
  }

  async approve(tenantId: string, schoolId: string, id: string, userId?: string): Promise<Admission> {
    const admission = await this.findOne(tenantId, schoolId, id);
    if (
      admission.status !== AdmissionStatus.UNDER_REVIEW &&
      admission.status !== AdmissionStatus.SUBMITTED
    ) {
      throw new BadRequestException(`Cannot approve application from ${admission.status} state.`);
    }

    admission.status = AdmissionStatus.APPROVED;
    admission.approvedBy = userId;
    admission.approvedAt = new Date();
    admission.updatedBy = userId;

    const saved = await this.admissionRepo.save(admission);

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId: admission.branchId,
      userId,
      module: 'admission',
      entity: 'Admission',
      entityId: id,
      action: 'APPROVE',
      newValue: saved,
    });

    return saved;
  }

  async reject(
    tenantId: string,
    schoolId: string,
    id: string,
    dto: RejectAdmissionDto,
    userId?: string,
  ): Promise<Admission> {
    const admission = await this.findOne(tenantId, schoolId, id);
    if (admission.status === AdmissionStatus.ENROLLED) {
      throw new BadRequestException('Cannot reject an enrolled student.');
    }

    admission.status = AdmissionStatus.REJECTED;
    admission.rejectedBy = userId;
    admission.rejectedAt = new Date();
    admission.rejectionReason = dto.rejectionReason;
    admission.updatedBy = userId;

    const saved = await this.admissionRepo.save(admission);

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId: admission.branchId,
      userId,
      module: 'admission',
      entity: 'Admission',
      entityId: id,
      action: 'REJECT',
      newValue: saved,
    });

    return saved;
  }

  async enroll(
    tenantId: string,
    schoolId: string,
    id: string,
    dto: EnrollAdmissionDto,
    userId?: string,
  ): Promise<{ admission: Admission; student: Student; enrollment: StudentEnrollment }> {
    const admission = await this.findOne(tenantId, schoolId, id);
    if (admission.status !== AdmissionStatus.APPROVED) {
      throw new BadRequestException('Only approved admissions can be enrolled.');
    }

    const targetSectionId = dto.sectionId || admission.preferredSectionId;
    if (!targetSectionId) {
      throw new BadRequestException('Please specify a section for student enrollment.');
    }

    return this.dataSource.transaction(async (manager) => {
      // 1. Generate unique student code
      const studentCode = await this.numberingSequenceService.getNextSequence(
        tenantId,
        schoolId,
        SequenceType.STUDENT,
        undefined,
        manager,
      );

      // 2. Create Student Master Record
      const student = manager.create(Student, {
        tenantId,
        schoolId,
        branchId: admission.branchId,
        studentCode,
        admissionNumber: admission.applicationNumber,
        firstName: admission.firstName,
        lastName: admission.lastName,
        dateOfBirth: admission.dateOfBirth,
        gender: admission.gender,
        mobile: admission.guardianMobile,
        email: admission.guardianEmail,
        status: StudentStatus.ACTIVE,
        createdBy: userId,
      });
      const savedStudent = await manager.save(Student, student);

      // 3. Create Guardian Record & Link
      const guardianNames = admission.guardianName.split(' ');
      const guardianFirstName = guardianNames[0] || admission.guardianName;
      const guardianLastName = guardianNames.slice(1).join(' ') || 'Guardian';

      const guardian = manager.create(Guardian, {
        tenantId,
        schoolId,
        branchId: admission.branchId,
        firstName: guardianFirstName,
        lastName: guardianLastName,
        mobile: admission.guardianMobile,
        email: admission.guardianEmail,
        relationshipType: GuardianRelationshipType.FATHER,
        createdBy: userId,
      });
      const savedGuardian = await manager.save(Guardian, guardian);

      const studentGuardian = manager.create(StudentGuardian, {
        tenantId,
        schoolId,
        branchId: admission.branchId,
        studentId: savedStudent.id,
        guardianId: savedGuardian.id,
        relationshipType: GuardianRelationshipType.FATHER,
        isPrimary: true,
        isEmergencyContact: true,
        receivesNotifications: true,
      });
      await manager.save(StudentGuardian, studentGuardian);

      // 4. Create Student Enrollment Record
      const enrollment = manager.create(StudentEnrollment, {
        tenantId,
        schoolId,
        branchId: admission.branchId,
        studentId: savedStudent.id,
        academicYearId: admission.academicYearId,
        classId: admission.classId,
        sectionId: targetSectionId,
        rollNumber: dto.rollNumber,
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: EnrollmentStatus.ACTIVE,
        startDate: new Date().toISOString().split('T')[0],
        createdBy: userId,
      });
      const savedEnrollment = await manager.save(StudentEnrollment, enrollment);

      // 5. Update Admission Record
      admission.status = AdmissionStatus.ENROLLED;
      admission.studentId = savedStudent.id;
      admission.updatedBy = userId;
      const savedAdmission = await manager.save(Admission, admission);

      await this.auditService.log({
        tenantId,
        schoolId,
        branchId: admission.branchId,
        userId,
        module: 'admission',
        entity: 'Admission',
        entityId: id,
        action: 'ENROLL',
        newValue: {
          admissionId: id,
          studentId: savedStudent.id,
          studentCode: savedStudent.studentCode,
          enrollmentId: savedEnrollment.id,
        },
      });

      return {
        admission: savedAdmission,
        student: savedStudent,
        enrollment: savedEnrollment,
      };
    });
  }
}
