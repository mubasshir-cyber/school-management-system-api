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
import { RbacService } from './rbac.service';
import { CreateRoleDto, CreatePermissionDto, AssignPermissionsDto } from './dto/rbac.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('RBAC')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Post('permissions')
  @RequirePermissions('rbac.permission.create')
  @ApiOperation({ summary: 'Create a new atomic permission' })
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.rbacService.createPermission(dto);
  }

  @Get('permissions')
  @RequirePermissions('rbac.permission.read')
  @ApiOperation({ summary: 'Get all available permissions' })
  getAllPermissions() {
    return this.rbacService.getAllPermissions();
  }

  @Post('roles')
  @RequirePermissions('rbac.role.create')
  @ApiOperation({ summary: 'Create a new custom or school role' })
  createRole(@Body() dto: CreateRoleDto) {
    return this.rbacService.createRole(dto);
  }

  @Get('roles')
  @RequirePermissions('rbac.role.read')
  @ApiOperation({ summary: 'Get all roles for active school' })
  getAllRoles(@Query('schoolId') schoolId?: string) {
    return this.rbacService.getAllRoles(schoolId);
  }

  @Get('roles/:id')
  @RequirePermissions('rbac.role.read')
  @ApiOperation({ summary: 'Get role details with assigned permissions' })
  getRoleById(@Param('id') id: string) {
    return this.rbacService.getRoleById(id);
  }

  @Post('roles/:id/permissions')
  @RequirePermissions('rbac.role.update')
  @ApiOperation({ summary: 'Assign permissions to role' })
  assignPermissions(
    @Param('id') id: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    return this.rbacService.assignPermissionsToRole(id, dto);
  }

  @Get('my-permissions')
  @ApiOperation({ summary: 'Get permissions of currently logged-in user' })
  getMyPermissions(@CurrentUser('userId') userId: string) {
    return this.rbacService.getUserPermissions(userId);
  }
}
