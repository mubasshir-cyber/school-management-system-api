import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto, StaffQueryDto } from './dto/staff.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Staff')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @RequirePermissions('staff.profile.create')
  @ApiOperation({ summary: 'Onboard a new staff member' })
  @ApiResponse({ status: 201, description: 'Staff member created successfully' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() createDto: CreateStaffDto,
  ) {
    return this.staffService.create(tenantId, schoolId, createDto, userId);
  }

  @Get()
  @RequirePermissions('staff.profile.read')
  @ApiOperation({ summary: 'Get staff directory with filters and pagination' })
  findAll(
    @CurrentUser('schoolId') schoolId: string,
    @Query() query: StaffQueryDto,
  ) {
    return this.staffService.findAll(schoolId, query);
  }

  @Get('statistics')
  @RequirePermissions('staff.profile.read')
  @ApiOperation({ summary: 'Get staff summary statistics' })
  getStatistics(@CurrentUser('schoolId') schoolId: string) {
    return this.staffService.getStatistics(schoolId);
  }

  @Get(':id')
  @RequirePermissions('staff.profile.read')
  @ApiOperation({ summary: 'Get staff 360 profile by ID' })
  findOne(
    @CurrentUser('schoolId') schoolId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.staffService.findOne(schoolId, id);
  }

  @Patch(':id')
  @RequirePermissions('staff.profile.update')
  @ApiOperation({ summary: 'Update staff member by ID' })
  update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateStaffDto,
  ) {
    return this.staffService.update(tenantId, schoolId, id, updateDto, userId);
  }

  @Delete(':id')
  @RequirePermissions('staff.profile.delete')
  @ApiOperation({ summary: 'Delete staff member by ID (Soft delete)' })
  remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.staffService.remove(tenantId, schoolId, id, userId);
  }
}
