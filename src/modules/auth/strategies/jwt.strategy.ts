import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, AuthenticatedUser } from '../../../common/interfaces/jwt-payload.interface';
import { UsersService } from '../../users/users.service';
import { RbacService } from '../../rbac/rbac.service';
import { CommonStatus } from '../../../common/enums/status.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly rbacService: RbacService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('jwt.secret') ||
        'super-secure-school-erp-jwt-secret-key-2026',
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.usersService.getUserById(payload.sub);

    if (!user || user.status !== CommonStatus.ACTIVE) {
      throw new UnauthorizedException('User account is inactive or disabled');
    }

    const permissions = await this.rbacService.getUserPermissions(user.id);
    const roles = user.userRoles?.map((ur) => ur.role?.code).filter(Boolean) || [];

    return {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      schoolId: user.schoolId,
      branchId: user.branchId,
      roles,
      permissions,
      scope: payload.scope,
      staffId: user.staffId,
      studentId: user.studentId,
      guardianId: user.guardianId,
    };
  }
}
