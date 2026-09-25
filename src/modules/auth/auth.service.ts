import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { RbacService } from '../rbac/rbac.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';
import { DataScope } from '../../common/enums/scope.enum';
import { CommonStatus } from '../../common/enums/status.enum';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rbacService: RbacService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly auditService: AuditService,
  ) {}

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== CommonStatus.ACTIVE) {
      throw new ForbiddenException('Your account has been deactivated or suspended');
    }

    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      throw new ForbiddenException(
        'Account is temporarily locked due to multiple failed login attempts. Please try again later.',
      );
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);

    if (!isPasswordValid) {
      await this.usersService.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.usersService.recordLogin(user.id, ipAddress);

    const tokens = await this.generateTokens(user);

    await this.auditService.log({
      tenantId: user.tenantId,
      schoolId: user.schoolId,
      branchId: user.branchId,
      userId: user.id,
      userEmail: user.email,
      action: 'LOGIN',
      module: 'auth',
      entity: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        tenantId: user.tenantId,
        schoolId: user.schoolId,
        branchId: user.branchId,
        roles: user.userRoles?.map((ur) => ur.role?.code).filter(Boolean) || [],
      },
      ...tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret:
          this.configService.get<string>('jwt.refreshSecret') ||
          'super-secure-school-erp-refresh-secret-key-2026',
      });

      const user = await this.usersService.getUserById(payload.sub);
      if (!user || user.status !== CommonStatus.ACTIVE) {
        throw new UnauthorizedException('Invalid token or user not active');
      }

      return this.generateTokens(user);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.refreshTokenRepo.update({ userId }, { isRevoked: true });
    return { success: true, message: 'Logged out successfully' };
  }

  private async generateTokens(user: any) {
    const roles = user.userRoles?.map((ur: any) => ur.role?.code).filter(Boolean) || [];
    const scope = user.userRoles?.[0]?.role?.defaultScope || DataScope.ORGANIZATION;

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      schoolId: user.schoolId,
      branchId: user.branchId,
      roles,
      scope,
    };

    const accessToken = this.jwtService.sign(payload as any, {
      secret:
        this.configService.get<string>('jwt.secret') ||
        'super-secure-school-erp-jwt-secret-key-2026',
      expiresIn: (this.configService.get<string>('jwt.expiresIn') || '15m') as any,
    });

    const refreshToken = this.jwtService.sign(payload as any, {
      secret:
        this.configService.get<string>('jwt.refreshSecret') ||
        'super-secure-school-erp-refresh-secret-key-2026',
      expiresIn: (this.configService.get<string>('jwt.refreshExpiresIn') || '7d') as any,
    });

    const tokenHash = await argon2.hash(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const refreshTokenRecord = this.refreshTokenRepo.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });
    await this.refreshTokenRepo.save(refreshTokenRecord);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }
}
