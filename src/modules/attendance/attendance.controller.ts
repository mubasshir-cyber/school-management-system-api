import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import {
  BulkSaveStudentAttendanceDto,
  StudentAttendanceQueryDto,
} from './dto/student-attendance.dto';
import {
  BulkSaveStaffAttendanceDto,
  StaffAttendanceQueryDto,
} from './dto/staff-attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Attendance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ===================== STUDENT ATTENDANCE =====================

  @Post('students/bulk')
  @RequirePermissions('attendance.student.update')
  @ApiOperation({ summary: 'Save daily student attendance for a class section in bulk' })
  @ApiResponse({ status: 200, description: 'Student attendance saved successfully' })
  bulkSaveStudentAttendance(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: BulkSaveStudentAttendanceDto,
  ) {
    return this.attendanceService.bulkSaveStudentAttendance(tenantId, schoolId, dto, userId);
  }

  @Get('students')
  @RequirePermissions('attendance.student.read')
  @ApiOperation({ summary: 'Query student attendance records' })
  getStudentAttendance(
    @CurrentUser('schoolId') schoolId: string,
    @Query() query: StudentAttendanceQueryDto,
  ) {
    return this.attendanceService.getStudentAttendance(schoolId, query);
  }

  // ===================== STAFF ATTENDANCE =====================

  @Post('staff/bulk')
  @RequirePermissions('attendance.staff.update')
  @ApiOperation({ summary: 'Save daily staff attendance & check-ins in bulk' })
  @ApiResponse({ status: 200, description: 'Staff attendance saved successfully' })
  bulkSaveStaffAttendance(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: BulkSaveStaffAttendanceDto,
  ) {
    return this.attendanceService.bulkSaveStaffAttendance(tenantId, schoolId, dto, userId);
  }

  @Get('staff')
  @RequirePermissions('attendance.staff.read')
  @ApiOperation({ summary: 'Query staff attendance records' })
  getStaffAttendance(
    @CurrentUser('schoolId') schoolId: string,
    @Query() query: StaffAttendanceQueryDto,
  ) {
    return this.attendanceService.getStaffAttendance(schoolId, query);
  }

  @Get('summary')
  @RequirePermissions('attendance.student.read')
  @ApiOperation({ summary: 'Get daily attendance percentage summary for dashboard meters' })
  getSummary(
    @CurrentUser('schoolId') schoolId: string,
    @Query('date') date?: string,
  ) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.attendanceService.getAttendanceSummary(schoolId, targetDate);
  }
}
