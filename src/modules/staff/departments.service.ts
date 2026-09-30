import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    private readonly auditService: AuditService,
  ) {}

  async create(tenantId: string, schoolId: string, createDto: CreateDepartmentDto, userId?: string): Promise<Department> {
    const existing = await this.departmentRepository.findOne({
      where: { schoolId, code: createDto.code, deletedAt: IsNull() },
    });

    if (existing) {
      throw new ConflictException(`Department with code '${createDto.code}' already exists`);
    }

    const dept = this.departmentRepository.create({
      ...createDto,
      tenantId,
      schoolId,
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.departmentRepository.save(dept);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId,
      action: 'CREATE',
      module: 'staff',
      entity: 'Department',
      entityId: saved.id,
      newValue: saved,
    });

    return saved;
  }

  async findAll(schoolId: string): Promise<Department[]> {
    return this.departmentRepository.find({
      where: { schoolId, deletedAt: IsNull() },
      relations: {
        designations: true,
        staffMembers: true,
      },
      order: { name: 'ASC' },
    });
  }

  async findOne(schoolId: string, id: string): Promise<Department> {
    const dept = await this.departmentRepository.findOne({
      where: { id, schoolId, deletedAt: IsNull() },
      relations: {
        designations: true,
        staffMembers: true,
      },
    });

    if (!dept) {
      throw new NotFoundException(`Department with ID '${id}' not found`);
    }

    return dept;
  }

  async update(tenantId: string, schoolId: string, id: string, updateDto: UpdateDepartmentDto, userId?: string): Promise<Department> {
    const dept = await this.findOne(schoolId, id);
    const oldValue = { ...dept };

    Object.assign(dept, {
      ...updateDto,
      updatedBy: userId,
    });

    const saved = await this.departmentRepository.save(dept);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId,
      action: 'UPDATE',
      module: 'staff',
      entity: 'Department',
      entityId: saved.id,
      oldValue,
      newValue: saved,
    });

    return saved;
  }

  async remove(tenantId: string, schoolId: string, id: string, userId?: string): Promise<void> {
    const dept = await this.findOne(schoolId, id);
    dept.deletedAt = new Date();
    dept.updatedBy = userId;
    await this.departmentRepository.save(dept);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId,
      action: 'DELETE',
      module: 'staff',
      entity: 'Department',
      entityId: id,
    });
  }
}
