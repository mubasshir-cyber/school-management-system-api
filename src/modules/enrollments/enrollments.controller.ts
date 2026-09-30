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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto, UpdateEnrollmentDto, TransferEnrollmentDto } from './dto/create-enrollment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { EnrollmentStatus } from '../../common/enums/status.enum';

@ApiTags('Enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post('enrollments')
  @RequirePermissions('enrollment.create')
  @ApiOperation({ summary: 'Enroll a student into a class & section' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateEnrollmentDto,
  ) {
    const enrollment = await this.enrollmentsService.create(tenantId, schoolId, branchId, dto, userId);
    return {
      success: true,
      message: 'Student enrolled successfully',
      data: enrollment,
    };
  }

  @Get('enrollments')
  @RequirePermissions('enrollment.read')
  @ApiOperation({ summary: 'List student enrollments by year, class, or section' })
  @ApiQuery({ name: 'academicYearId', required: false })
  @ApiQuery({ name: 'classId', required: false })
  @ApiQuery({ name: 'sectionId', required: false })
  @ApiQuery({ name: 'status', enum: EnrollmentStatus, required: false })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Query('academicYearId') academicYearId?: string,
    @Query('classId') classId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('status') status?: EnrollmentStatus,
  ) {
    const enrollments = await this.enrollmentsService.findAll(tenantId, schoolId, {
      academicYearId,
      classId,
      sectionId,
      status,
    });
    return {
      success: true,
      data: enrollments,
    };
  }

  @Get('students/:studentId/enrollments')
  @RequirePermissions('enrollment.read')
  @ApiOperation({ summary: 'Get complete enrollment history for a student' })
  async findByStudent(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ) {
    const history = await this.enrollmentsService.findByStudent(tenantId, schoolId, studentId);
    return {
      success: true,
      data: history,
    };
  }

  @Get('enrollments/:id')
  @RequirePermissions('enrollment.read')
  @ApiOperation({ summary: 'Get enrollment details' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const enrollment = await this.enrollmentsService.findOne(tenantId, schoolId, id);
    return {
      success: true,
      data: enrollment,
    };
  }

  @Patch('enrollments/:id')
  @RequirePermissions('enrollment.update')
  @ApiOperation({ summary: 'Update roll number or enrollment info' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEnrollmentDto,
  ) {
    const updated = await this.enrollmentsService.update(tenantId, schoolId, id, dto, userId);
    return {
      success: true,
      message: 'Enrollment updated successfully',
      data: updated,
    };
  }

  @Post('enrollments/:id/transfer')
  @RequirePermissions('enrollment.transfer')
  @ApiOperation({ summary: 'Transfer student to another class/section' })
  async transfer(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransferEnrollmentDto,
  ) {
    const transferred = await this.enrollmentsService.transfer(tenantId, schoolId, id, dto, userId);
    return {
      success: true,
      message: 'Student transferred successfully',
      data: transferred,
    };
  }

  @Post('enrollments/:id/withdraw')
  @RequirePermissions('enrollment.withdraw')
  @ApiOperation({ summary: 'Withdraw student from enrollment' })
  async withdraw(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason?: string,
  ) {
    const withdrawn = await this.enrollmentsService.withdraw(tenantId, schoolId, id, reason, userId);
    return {
      success: true,
      message: 'Student withdrawn from current enrollment',
      data: withdrawn,
    };
  }
}
