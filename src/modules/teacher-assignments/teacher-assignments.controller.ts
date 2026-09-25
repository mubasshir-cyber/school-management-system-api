import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TeacherAssignmentsService } from './teacher-assignments.service';
import { AssignTeacherToClassDto, AssignTeacherToSubjectDto } from './dto/teacher-assignment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Academic Structure')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('teacher-assignments')
export class TeacherAssignmentsController {
  constructor(
    private readonly teacherAssignmentsService: TeacherAssignmentsService,
  ) {}

  @Post('class')
  @RequirePermissions('assignment.create')
  @ApiOperation({ summary: 'Assign a teacher to a class section' })
  assignToClass(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Body() dto: AssignTeacherToClassDto,
  ) {
    return this.teacherAssignmentsService.assignToClass(tenantId, schoolId, dto);
  }

  @Get('classes')
  @RequirePermissions('assignment.read')
  @ApiOperation({ summary: 'List teacher class assignments' })
  findClassAssignments(
    @CurrentUser('schoolId') schoolId: string,
    @Query('teacherId') teacherId?: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.teacherAssignmentsService.findClassAssignments(
      schoolId,
      teacherId,
      academicYearId,
    );
  }

  @Delete('class/:id')
  @RequirePermissions('assignment.delete')
  @ApiOperation({ summary: 'Remove teacher class assignment' })
  removeClassAssignment(@Param('id') id: string) {
    return this.teacherAssignmentsService.removeClassAssignment(id);
  }

  @Post('subject')
  @RequirePermissions('assignment.create')
  @ApiOperation({ summary: 'Assign a teacher to teach a subject in a section' })
  assignToSubject(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Body() dto: AssignTeacherToSubjectDto,
  ) {
    return this.teacherAssignmentsService.assignToSubject(tenantId, schoolId, dto);
  }

  @Get('subjects')
  @RequirePermissions('assignment.read')
  @ApiOperation({ summary: 'List teacher subject assignments' })
  findSubjectAssignments(
    @CurrentUser('schoolId') schoolId: string,
    @Query('teacherId') teacherId?: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.teacherAssignmentsService.findSubjectAssignments(
      schoolId,
      teacherId,
      academicYearId,
    );
  }

  @Delete('subject/:id')
  @RequirePermissions('assignment.delete')
  @ApiOperation({ summary: 'Remove teacher subject assignment' })
  removeSubjectAssignment(@Param('id') id: string) {
    return this.teacherAssignmentsService.removeSubjectAssignment(id);
  }
}
