import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserRole } from './entities/user-role.entity';
import { CreateRoleDto, CreatePermissionDto, AssignPermissionsDto } from './dto/rbac.dto';
import { AuditService } from '../audit/audit.service';
import { TenantContext } from '../../common/context/tenant-context';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    private readonly auditService: AuditService,
  ) {}

  // ---------------- PERMISSIONS ----------------
  async createPermission(dto: CreatePermissionDto): Promise<Permission> {
    const existing = await this.permissionRepo.findOne({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException(`Permission code ${dto.code} already exists`);
    }

    const permission = this.permissionRepo.create(dto);
    const saved = await this.permissionRepo.save(permission);

    await this.auditService.log({
      tenantId: TenantContext.getTenantId(),
      schoolId: TenantContext.getSchoolId(),
      userId: TenantContext.getUserId(),
      action: 'CREATE',
      module: 'rbac',
      entity: 'Permission',
      entityId: saved.id,
      newValue: saved,
    });

    return saved;
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepo.find({ order: { module: 'ASC', resource: 'ASC', action: 'ASC' } });
  }

  // ---------------- ROLES ----------------
  async createRole(dto: CreateRoleDto): Promise<Role> {
    const tenantId = TenantContext.getTenantId();
    const schoolId = TenantContext.getSchoolId();

    const existing = await this.roleRepo.findOne({
      where: { code: dto.code, tenantId: tenantId ? tenantId : undefined },
    });
    if (existing) {
      throw new ConflictException(`Role with code ${dto.code} already exists`);
    }

    const role = this.roleRepo.create({
      ...dto,
      tenantId,
      schoolId,
    });

    const savedRole = await this.roleRepo.save(role);

    if (dto.permissionIds && dto.permissionIds.length > 0) {
      await this.assignPermissionsToRole(savedRole.id, { permissionIds: dto.permissionIds });
    }

    await this.auditService.log({
      tenantId,
      schoolId,
      userId: TenantContext.getUserId(),
      action: 'CREATE',
      module: 'rbac',
      entity: 'Role',
      entityId: savedRole.id,
      newValue: savedRole,
    });

    return this.getRoleById(savedRole.id);
  }

  async getAllRoles(schoolId?: string): Promise<Role[]> {
    const query = this.roleRepo
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.rolePermissions', 'rp')
      .leftJoinAndSelect('rp.permission', 'permission');

    if (schoolId) {
      query.where('role.school_id = :schoolId OR role.is_system = true', { schoolId });
    }

    return query.getMany();
  }

  async getRoleById(id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: {
        rolePermissions: {
          permission: true,
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async assignPermissionsToRole(
    roleId: string,
    dto: AssignPermissionsDto,
  ): Promise<Role> {
    const role = await this.getRoleById(roleId);

    const permissions = await this.permissionRepo.find({
      where: { id: In(dto.permissionIds) },
    });

    if (permissions.length !== dto.permissionIds.length) {
      throw new BadRequestException('One or more permission IDs are invalid');
    }

    // Remove existing permissions
    await this.rolePermissionRepo.delete({ roleId });

    // Assign new permissions
    const newRolePermissions = dto.permissionIds.map((permId) =>
      this.rolePermissionRepo.create({
        roleId,
        permissionId: permId,
      }),
    );

    await this.rolePermissionRepo.save(newRolePermissions);

    await this.auditService.log({
      tenantId: role.tenantId,
      schoolId: role.schoolId,
      userId: TenantContext.getUserId(),
      action: 'UPDATE_PERMISSIONS',
      module: 'rbac',
      entity: 'Role',
      entityId: role.id,
      newValue: dto.permissionIds,
    });

    return this.getRoleById(roleId);
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await this.userRoleRepo.find({
      where: { userId },
      relations: {
        role: {
          rolePermissions: {
            permission: true,
          },
        },
      },
    });

    const permissionSet = new Set<string>();

    for (const ur of userRoles) {
      if (ur.role && ur.role.rolePermissions) {
        for (const rp of ur.role.rolePermissions) {
          if (rp.permission && rp.permission.code) {
            permissionSet.add(rp.permission.code);
          }
        }
      }
    }

    return Array.from(permissionSet);
  }
}
