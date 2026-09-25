import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, CreateSchoolDto, CreateBranchDto } from './dto/tenants.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tenants & Schools')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @RequirePermissions('tenant.organization.create')
  @ApiOperation({ summary: 'Create a new tenant organization (Super Admin only)' })
  createTenant(@Body() dto: CreateTenantDto) {
    return this.tenantsService.createTenant(dto);
  }

  @Get()
  @RequirePermissions('tenant.organization.read')
  @ApiOperation({ summary: 'Get all tenant organizations' })
  getAllTenants() {
    return this.tenantsService.getAllTenants();
  }

  @Get(':id')
  @RequirePermissions('tenant.organization.read')
  @ApiOperation({ summary: 'Get tenant details by ID' })
  getTenantById(@Param('id') id: string) {
    return this.tenantsService.getTenantById(id);
  }

  @Post(':tenantId/schools')
  @RequirePermissions('school.profile.create')
  @ApiOperation({ summary: 'Create a school under a tenant' })
  createSchool(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateSchoolDto,
  ) {
    return this.tenantsService.createSchool(tenantId, dto);
  }

  @Get(':tenantId/schools')
  @RequirePermissions('school.profile.read')
  @ApiOperation({ summary: 'List all schools under a tenant' })
  getSchoolsByTenant(@Param('tenantId') tenantId: string) {
    return this.tenantsService.getSchoolsByTenant(tenantId);
  }

  @Post(':tenantId/schools/:schoolId/branches')
  @RequirePermissions('school.branch.create')
  @ApiOperation({ summary: 'Create a branch campus for a school' })
  createBranch(
    @Param('tenantId') tenantId: string,
    @Param('schoolId') schoolId: string,
    @Body() dto: CreateBranchDto,
  ) {
    return this.tenantsService.createBranch(tenantId, schoolId, dto);
  }

  @Get('schools/:schoolId/branches')
  @RequirePermissions('school.branch.read')
  @ApiOperation({ summary: 'Get all branches for a school' })
  getBranchesBySchool(@Param('schoolId') schoolId: string) {
    return this.tenantsService.getBranchesBySchool(schoolId);
  }
}
