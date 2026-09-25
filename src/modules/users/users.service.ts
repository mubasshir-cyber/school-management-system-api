import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from './entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import { UserRole } from '../rbac/entities/user-role.entity';
import { Role } from '../rbac/entities/role.entity';
import { CreateUserDto } from './dto/users.dto';
import { AuditService } from '../audit/audit.service';
import { TenantContext } from '../../common/context/tenant-context';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserSession)
    private readonly sessionRepo: Repository<UserSession>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    private readonly auditService: AuditService,
  ) {}

  async createUser(
    tenantId: string,
    schoolId: string,
    dto: CreateUserDto,
  ): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email, tenantId },
    });

    if (existing) {
      throw new ConflictException(
        `User with email ${dto.email} already exists in this organization`,
      );
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = this.userRepo.create({
      email: dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      userType: dto.userType,
      tenantId,
      schoolId,
      branchId: dto.branchId,
    });

    const savedUser = await this.userRepo.save(user);

    if (dto.roleIds && dto.roleIds.length > 0) {
      await this.assignRoles(savedUser.id, dto.roleIds);
    }

    await this.auditService.log({
      tenantId,
      schoolId,
      userId: TenantContext.getUserId(),
      action: 'CREATE',
      module: 'users',
      entity: 'User',
      entityId: savedUser.id,
      newValue: { email: savedUser.email, userType: savedUser.userType },
    });

    return this.getUserById(savedUser.id);
  }

  async getAllUsers(schoolId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.userRepo.findAndCount({
      where: { schoolId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: {
        userRoles: {
          role: true,
        },
      },
    });

    return {
      items: items.map((u) => {
        const { passwordHash, ...safeUser } = u;
        return safeUser;
      }),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: {
        userRoles: {
          role: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string, tenantId?: string): Promise<User | null> {
    const where: any = { email };
    if (tenantId) where.tenantId = tenantId;

    return this.userRepo.findOne({
      where,
      relations: {
        userRoles: {
          role: true,
        },
      },
    });
  }

  async assignRoles(userId: string, roleIds: string[]) {
    await this.getUserById(userId);

    const roles = await this.roleRepo.find({
      where: { id: In(roleIds) },
    });

    if (roles.length !== roleIds.length) {
      throw new BadRequestException('One or more role IDs are invalid');
    }

    await this.userRoleRepo.delete({ userId });

    const userRoles = roleIds.map((roleId) =>
      this.userRoleRepo.create({
        userId,
        roleId,
      }),
    );

    await this.userRoleRepo.save(userRoles);
  }

  async recordLogin(userId: string, ip?: string) {
    await this.userRepo.update(userId, {
      lastLoginAt: new Date(),
      lastLoginIp: ip,
      failedLoginAttempts: 0,
      lockedUntil: null as any,
    });
  }

  async handleFailedLogin(user: User) {
    const attempts = user.failedLoginAttempts + 1;
    const updates: Partial<User> = { failedLoginAttempts: attempts };

    if (attempts >= 5) {
      const lockDurationMinutes = 15;
      updates.lockedUntil = new Date(Date.now() + lockDurationMinutes * 60 * 1000);
    }

    await this.userRepo.update(user.id, updates);
  }
}
