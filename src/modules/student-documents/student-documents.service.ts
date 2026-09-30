import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentDocument } from './entities/student-document.entity';
import { Student } from '../students/entities/student.entity';
import { AuditService } from '../audit/audit.service';
import { CreateStudentDocumentDto, VerifyStudentDocumentDto } from './dto/create-student-document.dto';

@Injectable()
export class StudentDocumentsService {
  private readonly logger = new Logger(StudentDocumentsService.name);

  constructor(
    @InjectRepository(StudentDocument)
    private readonly documentRepo: Repository<StudentDocument>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    private readonly auditService: AuditService,
  ) {}

  async create(
    tenantId: string,
    schoolId: string,
    defaultBranchId: string,
    dto: CreateStudentDocumentDto,
    userId?: string,
  ): Promise<StudentDocument> {
    const branchId = dto.branchId || defaultBranchId;

    const student = await this.studentRepo.findOne({
      where: { id: dto.studentId, schoolId, deletedAt: undefined },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${dto.studentId} not found.`);
    }

    const doc = this.documentRepo.create({
      ...dto,
      tenantId,
      schoolId,
      branchId,
      createdBy: userId,
    });

    const saved = await this.documentRepo.save(doc);

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId,
      userId,
      module: 'student_document',
      entity: 'StudentDocument',
      entityId: saved.id,
      action: 'UPLOAD_DOCUMENT',
      newValue: saved,
    });

    return saved;
  }

  async findByStudent(tenantId: string, schoolId: string, studentId: string) {
    return this.documentRepo.find({
      where: { studentId, schoolId, deletedAt: undefined },
      relations: { verifier: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, schoolId: string, id: string): Promise<StudentDocument> {
    const doc = await this.documentRepo.findOne({
      where: { id, schoolId, deletedAt: undefined },
      relations: { student: true, verifier: true },
    });

    if (!doc) {
      throw new NotFoundException(`Student document with ID ${id} not found.`);
    }

    return doc;
  }

  async verify(
    tenantId: string,
    schoolId: string,
    id: string,
    dto: VerifyStudentDocumentDto,
    userId?: string,
  ): Promise<StudentDocument> {
    const doc = await this.findOne(tenantId, schoolId, id);

    doc.isVerified = dto.isVerified;
    doc.verifiedBy = dto.isVerified ? userId : undefined;
    doc.verifiedAt = dto.isVerified ? new Date() : undefined;
    doc.updatedBy = userId;

    const saved = await this.documentRepo.save(doc);

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId: doc.branchId,
      userId,
      module: 'student_document',
      entity: 'StudentDocument',
      entityId: id,
      action: 'VERIFY_DOCUMENT',
      newValue: { isVerified: doc.isVerified, verifiedBy: userId },
    });

    return saved;
  }

  async remove(tenantId: string, schoolId: string, id: string, userId?: string): Promise<void> {
    const doc = await this.findOne(tenantId, schoolId, id);

    await this.documentRepo.softDelete(id);

    await this.auditService.log({
      tenantId,
      schoolId,
      branchId: doc.branchId,
      userId,
      module: 'student_document',
      entity: 'StudentDocument',
      entityId: id,
      action: 'DELETE_DOCUMENT',
      oldValue: doc,
    });
  }
}
