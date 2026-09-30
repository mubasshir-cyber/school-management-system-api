import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { Staff, StaffStatus } from './entities/staff.entity';
import { CreateStaffDto, UpdateStaffDto, StaffQueryDto } from './dto/staff.dto';
import { User } from '../users/entities/user.entity';
import { Role } from '../rbac/entities/role.entity';
import { UserRole } from '../rbac/entities/user-role.entity';
import { NumberingSequenceService } from '../students/services/numbering-sequence.service';
import { AuditService } from '../audit/audit.service';
import { SequenceType } from '../../common/enums/status.enum';
import { UserType } from '../../common/enums/role.enum';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly numberingSequenceService: NumberingSequenceService,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  async create(tenantId: string, schoolId: string, createDto: CreateStaffDto, userId?: string): Promise<Staff> {
    return this.dataSource.transaction(async (manager) => {
      // Check duplicate email
      const existingEmail = await manager.findOne(Staff, {
        where: { schoolId, email: createDto.email, deletedAt: IsNull() },
      });
      if (existingEmail) {
        throw new ConflictException(`Staff with email '${createDto.email}' already exists in this school`);
      }

      // Auto-generate employee code if not provided
      let employeeCode = createDto.employeeCode;
      if (!employeeCode) {
        employeeCode = await this.numberingSequenceService.getNextSequence(
          tenantId,
          schoolId,
          SequenceType.EMPLOYEE,
          undefined,
          manager,
        );
      }

      let createdUserId: string | undefined = undefined;

      // Optional user account provisioning
      if (createDto.createUserAccount) {
        const existingUser = await manager.findOne(User, {
          where: { email: createDto.email, deletedAt: IsNull() },
        });

        if (!existingUser) {
          const defaultPassword = await argon2.hash('Staff@2026');
          const newUser = manager.create(User, {
            tenantId,
            schoolId,
            email: createDto.email,
            passwordHash: defaultPassword,
            firstName: createDto.firstName,
            lastName: createDto.lastName,
            userType: UserType.STAFF,
            createdBy: userId,
          });

          const savedUser = await manager.save(User, newUser);
          createdUserId = savedUser.id;

          // Assign role if specified
          if (createDto.roleName) {
            const role = await manager.findOne(Role, {
              where: { schoolId, name: createDto.roleName, deletedAt: IsNull() },
            });
            if (role) {
              const userRole = manager.create(UserRole, {
                tenantId,
                schoolId,
                userId: savedUser.id,
                roleId: role.id,
                createdBy: userId,
              });
              await manager.save(UserRole, userRole);
            }
          }
        } else {
          createdUserId = existingUser.id;
        }
      }

      const staff = manager.create(Staff, {
        ...createDto,
        employeeCode,
        userId: createdUserId,
        tenantId,
        schoolId,
        createdBy: userId,
        updatedBy: userId,
      });

      const saved = await manager.save(Staff, staff);

      await this.auditService.log({
        tenantId,
        schoolId,
        userId,
        action: 'CREATE',
        module: 'staff',
        entity: 'Staff',
        entityId: saved.id,
        newValue: saved,
      });

      return saved;
    });
  }

  async findAll(schoolId: string, query: StaffQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const qb = this.staffRepository
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.department', 'department')
      .leftJoinAndSelect('staff.designation', 'designation')
      .where('staff.school_id = :schoolId', { schoolId })
      .andWhere('staff.deleted_at IS NULL');

    if (query.search) {
      qb.andWhere(
        '(staff.first_name ILIKE :search OR staff.last_name ILIKE :search OR staff.employee_code ILIKE :search OR staff.email ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.departmentId) {
      qb.andWhere('staff.department_id = :deptId', { deptId: query.departmentId });
    }

    if (query.designationId) {
      qb.andWhere('staff.designation_id = :desigId', { desigId: query.designationId });
    }

    if (query.employmentType) {
      qb.andWhere('staff.employment_type = :empType', { empType: query.employmentType });
    }

    if (query.status) {
      qb.andWhere('staff.status = :status', { status: query.status });
    }

    qb.orderBy('staff.first_name', 'ASC');
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(schoolId: string, id: string): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: { id, schoolId, deletedAt: IsNull() },
      relations: {
        department: true,
        designation: true,
        documents: true,
        user: true,
      },
    });

    if (!staff) {
      throw new NotFoundException(`Staff member with ID '${id}' not found`);
    }

    return staff;
  }

  async update(tenantId: string, schoolId: string, id: string, updateDto: UpdateStaffDto, userId?: string): Promise<Staff> {
    const staff = await this.findOne(schoolId, id);
    const oldValue = { ...staff };

    Object.assign(staff, {
      ...updateDto,
      updatedBy: userId,
    });

    const saved = await this.staffRepository.save(staff);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId,
      action: 'UPDATE',
      module: 'staff',
      entity: 'Staff',
      entityId: saved.id,
      oldValue,
      newValue: saved,
    });

    return saved;
  }

  async remove(tenantId: string, schoolId: string, id: string, userId?: string): Promise<void> {
    const staff = await this.findOne(schoolId, id);
    staff.deletedAt = new Date();
    staff.status = StaffStatus.RESIGNED;
    staff.updatedBy = userId;
    await this.staffRepository.save(staff);

    await this.auditService.log({
      tenantId,
      schoolId,
      userId,
      action: 'DELETE',
      module: 'staff',
      entity: 'Staff',
      entityId: id,
    });
  }

  async getStatistics(schoolId: string) {
    const total = await this.staffRepository.count({
      where: { schoolId, deletedAt: IsNull() },
    });

    const active = await this.staffRepository.count({
      where: { schoolId, status: StaffStatus.ACTIVE, deletedAt: IsNull() },
    });

    const onLeave = await this.staffRepository.count({
      where: { schoolId, status: StaffStatus.ON_LEAVE, deletedAt: IsNull() },
    });

    return {
      total,
      active,
      onLeave,
    };
  }
}
