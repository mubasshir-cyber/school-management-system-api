import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DesignationsService } from './designations.service';
import { CreateDesignationDto, UpdateDesignationDto } from './dto/designation.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Designations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('designations')
export class DesignationsController {
  constructor(private readonly designationsService: DesignationsService) {}

  @Post()
  @RequirePermissions('staff.designation.manage')
  @ApiOperation({ summary: 'Create a new designation' })
  @ApiResponse({ status: 201, description: 'Designation created successfully' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() createDto: CreateDesignationDto,
  ) {
    return this.designationsService.create(tenantId, schoolId, createDto, userId);
  }

  @Get()
  @RequirePermissions('staff.profile.read')
  @ApiOperation({ summary: 'Get all designations for school with optional department filtering' })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  findAll(
    @CurrentUser('schoolId') schoolId: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.designationsService.findAll(schoolId, departmentId);
  }

  @Get(':id')
  @RequirePermissions('staff.profile.read')
  @ApiOperation({ summary: 'Get designation details by ID' })
  findOne(
    @CurrentUser('schoolId') schoolId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.designationsService.findOne(schoolId, id);
  }

  @Patch(':id')
  @RequirePermissions('staff.designation.manage')
  @ApiOperation({ summary: 'Update designation by ID' })
  update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateDesignationDto,
  ) {
    return this.designationsService.update(tenantId, schoolId, id, updateDto, userId);
  }

  @Delete(':id')
  @RequirePermissions('staff.designation.manage')
  @ApiOperation({ summary: 'Delete designation by ID (Soft delete)' })
  remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.designationsService.remove(tenantId, schoolId, id, userId);
  }
}
