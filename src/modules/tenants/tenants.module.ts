import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { School } from './entities/school.entity';
import { Branch } from './entities/branch.entity';
import { SchoolSettings } from './entities/school-settings.entity';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, School, Branch, SchoolSettings]),
  ],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService, TypeOrmModule],
})
export class TenantsModule {}
