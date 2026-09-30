import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Student } from './entities/student.entity';
import { NumberingSequenceService } from './services/numbering-sequence.service';
import { AuditService } from '../audit/audit.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentFilterDto } from './dto/student-filter.dto';
import { SequenceType, StudentStatus } from '../../common/enums/status.enum';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    private readonly numberingSequenceService: NumberingSequenceService,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    tenantId: string,
    schoolId: string,
    defaultBranchId: string,
    dto: CreateStudentDto,
    userId?: string,
  ): Promise<Student> {
    const branchId = dto.branchId || defaultBranchId;

    return this.dataSource.transaction(async (manager) => {
      let studentCode = dto.studentCode;
      if (!studentCode) {
        studentCode = await this.numberingSequenceService.getNextSequence(
          tenantId,
          schoolId,
          SequenceType.STUDENT,
          undefined,
          manager,
        );
      }

      // Ensure uniqueness
      const existing = await manager.findOne(Student, {
        where: { schoolId, studentCode },
      });
      if (existing) {
        throw new ConflictException(`Student code ${studentCode} already exists in this school.`);
      }

      const student = manager.create(Student, {
        ...dto,
        tenantId,
        schoolId,
        branchId,
        studentCode,
        createdBy: userId,
      });

      const saved = await manager.save(Student, student);

      await this.auditService.log({
        tenantId,
        schoolId,
        branchId,
        userId,
        module: 'student',
        entity: 'Student',
        entityId: saved.id,
        action: 'CREATE',
        newValue: saved,
      });

      return saved;
    });
  }

  async findAll(tenantId: string, schoolId: string, filter: StudentFilterDto) {
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.studentRepo
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.enrollments', 'enrollment', 'enrollment.deletedAt IS NULL AND enrollment.status = :activeStatus', {
        activeStatus: 'ACTIVE',
      })
      .leftJoinAndSelect('enrollment.class', 'class')
      .leftJoinAndSelect('enrollment.section', 'section')
      .leftJoinAndSelect('enrollment.academicYear', 'academicYear')
      .leftJoinAndSelect('student.guardians', 'studentGuardian')
      .leftJoinAndSelect('studentGuardian.guardian', 'guardian')
      .where('student.schoolId = :schoolId', { schoolId })
      .andWhere('student.deletedAt IS NULL');

    if (filter.search) {
      qb.andWhere(
        '(LOWER(student.firstName) LIKE LOWER(:search) OR LOWER(student.lastName) LIKE LOWER(:search) OR LOWER(student.studentCode) LIKE LOWER(:search) OR LOWER(student.admissionNumber) LIKE LOWER(:search) OR student.mobile LIKE :search OR LOWER(guardian.firstName) LIKE LOWER(:search))',
        { search: `%${filter.search}%` },
      );
    }

    if (filter.status) {
      qb.andWhere('student.status = :status', { status: filter.status });
    }

    if (filter.gender) {
      qb.andWhere('student.gender = :gender', { gender: filter.gender });
    }

    if (filter.classId) {
      qb.andWhere('enrollment.classId = :classId', { classId: filter.classId });
    }

    if (filter.sectionId) {
      qb.andWhere('enrollment.sectionId = :sectionId', { sectionId: filter.sectionId });
    }

    if (filter.academicYearId) {
      qb.andWhere('enrollment.academicYearId = :academicYearId', {
        academicYearId: filter.academicYearId,
      });
    }

    qb.orderBy('student.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, schoolId: string, id: string): Promise<Student> {
    const student = await this.studentRepo
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.guardians', 'studentGuardian')
      .leftJoinAndSelect('studentGuardian.guardian', 'guardian')
      .leftJoinAndSelect('student.enrollments', 'enrollment')
      .leftJoinAndSelect('enrollment.class', 'class')
      .leftJoinAndSelect('enrollment.section', 'section')
      .leftJoinAndSelect('enrollment.academicYear', 'academicYear')
      .leftJoinAndSelect('student.documents', 'document')
      .where('student.id = :id', { id })
      .andWhere('student.schoolId = :schoolId', { schoolId })
      .andWhere('student.deletedAt IS NULL')
      .getOne();

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found.`);
    }

    return student;
  }

  async update(
    tenantId: string,
    schoolId: string,
    id: string,
    dto: UpdateStudentDto,
    userId?: string,
  ): Promise<Student> {
    const student = await this.findOne(tenantId, schoolId, id);
    const oldState = { ...student };

    Object.assign(student, dto, { updatedBy: userId });
    const saved = await this.studentRepo.save(student);

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId: student.branchId,
      userId,
      module: 'student',
      entity: 'Student',
      entityId: id,
      action: 'UPDATE',
      oldValue: oldState,
      newValue: saved,
    });

    return saved;
  }

  async updateStatus(
    tenantId: string,
    schoolId: string,
    id: string,
    status: StudentStatus,
    userId?: string,
  ): Promise<Student> {
    const student = await this.findOne(tenantId, schoolId, id);
    const oldState = { status: student.status };

    student.status = status;
    student.updatedBy = userId;
    const saved = await this.studentRepo.save(student);

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId: student.branchId,
      userId,
      module: 'student',
      entity: 'Student',
      entityId: id,
      action: 'UPDATE_STATUS',
      oldValue: oldState,
      newValue: { status },
    });

    return saved;
  }

  async remove(tenantId: string, schoolId: string, id: string, userId?: string): Promise<void> {
    const student = await this.findOne(tenantId, schoolId, id);

    await this.studentRepo.softDelete(id);

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId: student.branchId,
      userId,
      module: 'student',
      entity: 'Student',
      entityId: id,
      action: 'DELETE',
      oldValue: student,
    });
  }

  async getStatistics(tenantId: string, schoolId: string) {
    const total = await this.studentRepo.count({
      where: { schoolId, deletedAt: undefined },
    });

    const active = await this.studentRepo.count({
      where: { schoolId, status: StudentStatus.ACTIVE, deletedAt: undefined },
    });

    const registered = await this.studentRepo.count({
      where: { schoolId, status: StudentStatus.REGISTERED, deletedAt: undefined },
    });

    const male = await this.studentRepo.count({
      where: { schoolId, gender: 'Male', deletedAt: undefined },
    });

    const female = await this.studentRepo.count({
      where: { schoolId, gender: 'Female', deletedAt: undefined },
    });

    return {
      total,
      active,
      registered,
      male,
      female,
    };
  }
}
