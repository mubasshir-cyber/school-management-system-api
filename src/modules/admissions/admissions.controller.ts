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
import { AdmissionsService } from './admissions.service';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionDto } from './dto/update-admission.dto';
import {
  ReviewAdmissionDto,
  RejectAdmissionDto,
  EnrollAdmissionDto,
} from './dto/review-admission.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdmissionStatus } from '../../common/enums/status.enum';

@ApiTags('Admissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('admissions')
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Post()
  @RequirePermissions('admission.create')
  @ApiOperation({ summary: 'Submit a new admission application (starts as DRAFT)' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateAdmissionDto,
  ) {
    const admission = await this.admissionsService.create(tenantId, schoolId, branchId, dto, userId);
    return {
      success: true,
      message: 'Admission application created',
      data: admission,
    };
  }

  @Get()
  @RequirePermissions('admission.read')
  @ApiOperation({ summary: 'List admission applications with filters' })
  @ApiQuery({ name: 'status', enum: AdmissionStatus, required: false })
  @ApiQuery({ name: 'academicYearId', required: false })
  @ApiQuery({ name: 'classId', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Query('status') status?: AdmissionStatus,
    @Query('academicYearId') academicYearId?: string,
    @Query('classId') classId?: string,
    @Query('search') search?: string,
  ) {
    const admissions = await this.admissionsService.findAll(tenantId, schoolId, {
      status,
      academicYearId,
      classId,
      search,
    });
    return {
      success: true,
      data: admissions,
    };
  }

  @Get(':id')
  @RequirePermissions('admission.read')
  @ApiOperation({ summary: 'Get admission application details' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const admission = await this.admissionsService.findOne(tenantId, schoolId, id);
    return {
      success: true,
      data: admission,
    };
  }

  @Patch(':id')
  @RequirePermissions('admission.update')
  @ApiOperation({ summary: 'Update admission application' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdmissionDto,
  ) {
    const updated = await this.admissionsService.update(tenantId, schoolId, id, dto, userId);
    return {
      success: true,
      message: 'Admission application updated',
      data: updated,
    };
  }

  @Post(':id/submit')
  @RequirePermissions('admission.submit')
  @ApiOperation({ summary: 'Submit admission application (DRAFT -> SUBMITTED)' })
  async submit(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const submitted = await this.admissionsService.submit(tenantId, schoolId, id, userId);
    return {
      success: true,
      message: 'Admission application submitted for review',
      data: submitted,
    };
  }

  @Post(':id/review')
  @RequirePermissions('admission.review')
  @ApiOperation({ summary: 'Mark application as UNDER_REVIEW' })
  async review(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReviewAdmissionDto,
  ) {
    const reviewed = await this.admissionsService.review(tenantId, schoolId, id, dto, userId);
    return {
      success: true,
      message: 'Admission application marked under review',
      data: reviewed,
    };
  }

  @Post(':id/approve')
  @RequirePermissions('admission.approve')
  @ApiOperation({ summary: 'Approve admission application (UNDER_REVIEW -> APPROVED)' })
  async approve(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const approved = await this.admissionsService.approve(tenantId, schoolId, id, userId);
    return {
      success: true,
      message: 'Admission application approved',
      data: approved,
    };
  }

  @Post(':id/reject')
  @RequirePermissions('admission.reject')
  @ApiOperation({ summary: 'Reject admission application' })
  async reject(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectAdmissionDto,
  ) {
    const rejected = await this.admissionsService.reject(tenantId, schoolId, id, dto, userId);
    return {
      success: true,
      message: 'Admission application rejected',
      data: rejected,
    };
  }

  @Post(':id/enroll')
  @RequirePermissions('admission.enroll')
  @ApiOperation({
    summary: 'Enroll approved student: creates Student, Guardian, and active Enrollment',
  })
  async enroll(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EnrollAdmissionDto,
  ) {
    const result = await this.admissionsService.enroll(tenantId, schoolId, id, dto, userId);
    return {
      success: true,
      message: 'Student successfully admitted and enrolled!',
      data: result,
    };
  }
}
