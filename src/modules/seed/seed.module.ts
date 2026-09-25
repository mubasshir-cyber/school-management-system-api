import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { School } from '../tenants/entities/school.entity';
import { Branch } from '../tenants/entities/branch.entity';
import { Permission } from '../rbac/entities/permission.entity';
import { Role } from '../rbac/entities/role.entity';
import { RolePermission } from '../rbac/entities/role-permission.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../rbac/entities/user-role.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      School,
      Branch,
      Permission,
      Role,
      RolePermission,
      User,
      UserRole,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
