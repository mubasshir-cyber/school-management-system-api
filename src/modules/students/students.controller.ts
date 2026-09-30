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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentFilterDto } from './dto/student-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StudentStatus } from '../../common/enums/status.enum';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @RequirePermissions('student.profile.create')
  @ApiOperation({ summary: 'Create a new student with auto-generated code' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateStudentDto,
  ) {
    const student = await this.studentsService.create(tenantId, schoolId, branchId, dto, userId);
    return {
      success: true,
      message: 'Student registered successfully',
      data: student,
    };
  }

  @Get('statistics')
  @RequirePermissions('student.profile.read')
  @ApiOperation({ summary: 'Get student population metrics and statistics' })
  async getStatistics(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
  ) {
    const stats = await this.studentsService.getStatistics(tenantId, schoolId);
    return {
      success: true,
      data: stats,
    };
  }

  @Get()
  @RequirePermissions('student.profile.read')
  @ApiOperation({ summary: 'Search and filter students with pagination' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Query() filter: StudentFilterDto,
  ) {
    const result = await this.studentsService.findAll(tenantId, schoolId, filter);
    return {
      success: true,
      data: result.items,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }

  @Get(':id')
  @RequirePermissions('student.profile.read')
  @ApiOperation({ summary: 'Get student 360-degree profile' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const student = await this.studentsService.findOne(tenantId, schoolId, id);
    return {
      success: true,
      data: student,
    };
  }

  @Patch(':id')
  @RequirePermissions('student.profile.update')
  @ApiOperation({ summary: 'Update student record' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudentDto,
  ) {
    const updated = await this.studentsService.update(tenantId, schoolId, id, dto, userId);
    return {
      success: true,
      message: 'Student updated successfully',
      data: updated,
    };
  }

  @Patch(':id/status')
  @RequirePermissions('student.profile.update')
  @ApiOperation({ summary: 'Update student status (Active, Inactive, Suspended, etc.)' })
  async updateStatus(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: StudentStatus,
  ) {
    const updated = await this.studentsService.updateStatus(tenantId, schoolId, id, status, userId);
    return {
      success: true,
      message: `Student status updated to ${status}`,
      data: updated,
    };
  }

  @Delete(':id')
  @RequirePermissions('student.profile.delete')
  @ApiOperation({ summary: 'Soft-delete a student record' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.studentsService.remove(tenantId, schoolId, id, userId);
    return {
      success: true,
      message: 'Student archived successfully',
    };
  }
}
