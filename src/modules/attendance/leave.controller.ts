import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LeaveService } from './leave.service';
import { CreateLeaveTypeDto, UpdateLeaveTypeDto } from './dto/leave-type.dto';
import {
  CreateLeaveRequestDto,
  ReviewLeaveRequestDto,
  LeaveRequestQueryDto,
} from './dto/leave-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Leaves')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('leaves')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  // ===================== LEAVE TYPES =====================

  @Post('types')
  @RequirePermissions('attendance.leave.manage')
  @ApiOperation({ summary: 'Create a new leave type category' })
  @ApiResponse({ status: 201, description: 'Leave type created' })
  createLeaveType(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateLeaveTypeDto,
  ) {
    return this.leaveService.createLeaveType(tenantId, schoolId, dto, userId);
  }

  @Get('types')
  @RequirePermissions('attendance.leave.read')
  @ApiOperation({ summary: 'Get all configured leave types' })
  getLeaveTypes(@CurrentUser('schoolId') schoolId: string) {
    return this.leaveService.getLeaveTypes(schoolId);
  }

  @Patch('types/:id')
  @RequirePermissions('attendance.leave.manage')
  @ApiOperation({ summary: 'Update leave type configuration' })
  updateLeaveType(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeaveTypeDto,
  ) {
    return this.leaveService.updateLeaveType(tenantId, schoolId, id, dto, userId);
  }

  // ===================== LEAVE REQUESTS =====================

  @Post('requests')
  @RequirePermissions('attendance.leave.apply')
  @ApiOperation({ summary: 'Submit a new leave application' })
  @ApiResponse({ status: 201, description: 'Leave application submitted' })
  createLeaveRequest(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateLeaveRequestDto,
  ) {
    return this.leaveService.createLeaveRequest(tenantId, schoolId, userId, dto);
  }

  @Get('requests')
  @RequirePermissions('attendance.leave.read')
  @ApiOperation({ summary: 'Get leave requests with filtering and pagination' })
  getLeaveRequests(
    @CurrentUser('schoolId') schoolId: string,
    @Query() query: LeaveRequestQueryDto,
  ) {
    return this.leaveService.getLeaveRequests(schoolId, query);
  }

  @Patch('requests/:id/review')
  @RequirePermissions('attendance.leave.approve')
  @ApiOperation({ summary: 'Approve or reject a leave application' })
  reviewLeaveRequest(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewLeaveRequestDto,
  ) {
    return this.leaveService.reviewLeaveRequest(tenantId, schoolId, id, dto, userId);
  }
}
