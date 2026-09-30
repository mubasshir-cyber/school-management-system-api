import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Departments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @RequirePermissions('staff.department.manage')
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() createDto: CreateDepartmentDto,
  ) {
    return this.departmentsService.create(tenantId, schoolId, createDto, userId);
  }

  @Get()
  @RequirePermissions('staff.profile.read')
  @ApiOperation({ summary: 'Get all departments for current school' })
  findAll(@CurrentUser('schoolId') schoolId: string) {
    return this.departmentsService.findAll(schoolId);
  }

  @Get(':id')
  @RequirePermissions('staff.profile.read')
  @ApiOperation({ summary: 'Get department details by ID' })
  findOne(
    @CurrentUser('schoolId') schoolId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.departmentsService.findOne(schoolId, id);
  }

  @Patch(':id')
  @RequirePermissions('staff.department.manage')
  @ApiOperation({ summary: 'Update department by ID' })
  update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(tenantId, schoolId, id, updateDto, userId);
  }

  @Delete(':id')
  @RequirePermissions('staff.department.manage')
  @ApiOperation({ summary: 'Delete department by ID (Soft delete)' })
  remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.departmentsService.remove(tenantId, schoolId, id, userId);
  }
}
