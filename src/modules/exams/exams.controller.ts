import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ExamsService } from './exams.service';
import { CreateExamTypeDto } from './dto/create-exam-type.dto';
import { CreateGradingScaleDto } from './dto/create-grading-scale.dto';
import { CreateExamDto } from './dto/create-exam.dto';
import { CreateExamScheduleDto } from './dto/create-exam-schedule.dto';
import { SubmitMarksDto } from './dto/submit-marks.dto';
import { CalculateResultsDto } from './dto/calculate-results.dto';
import { ExamStatus } from './exams.enums';

@ApiTags('Exams & Results')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  // 1. Exam Types
  @Get('types')
  @ApiOperation({ summary: 'List all exam types for tenant' })
  getExamTypes(@Request() req: any) {
    return this.examsService.getExamTypes(req.user.tenantId);
  }

  @Post('types')
  @ApiOperation({ summary: 'Create an exam type' })
  createExamType(@Request() req: any, @Body() dto: CreateExamTypeDto) {
    return this.examsService.createExamType(req.user.tenantId, dto);
  }

  // 2. Grading Scales
  @Get('grading-scales')
  @ApiOperation({ summary: 'List all grading scales' })
  getGradingScales(@Request() req: any) {
    return this.examsService.getGradingScales(req.user.tenantId);
  }

  @Post('grading-scales')
  @ApiOperation({ summary: 'Create a grading scale' })
  createGradingScale(@Request() req: any, @Body() dto: CreateGradingScaleDto) {
    return this.examsService.createGradingScale(req.user.tenantId, dto);
  }

  // 3. Exams
  @Get()
  @ApiOperation({ summary: 'List all exams with pagination and filters' })
  getExams(
    @Request() req: any,
    @Query('academicYearId') academicYearId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.examsService.getExams(req.user.tenantId, {
      academicYearId,
      status,
      page,
      limit,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new exam' })
  createExam(@Request() req: any, @Body() dto: CreateExamDto) {
    return this.examsService.createExam(req.user.tenantId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exam details by ID' })
  getExamById(@Request() req: any, @Param('id') id: string) {
    return this.examsService.getExamById(req.user.tenantId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update exam status' })
  updateExamStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body('status') status: ExamStatus,
  ) {
    return this.examsService.updateExamStatus(req.user.tenantId, id, status);
  }

  // 4. Exam Schedules
  @Get(':id/schedules')
  @ApiOperation({ summary: 'List exam timetable schedules' })
  getSchedules(
    @Request() req: any,
    @Param('id') id: string,
    @Query('classId') classId?: string,
    @Query('sectionId') sectionId?: string,
  ) {
    return this.examsService.getSchedules(req.user.tenantId, id, classId, sectionId);
  }

  @Post('schedules')
  @ApiOperation({ summary: 'Add a timetable slot / exam schedule' })
  createSchedule(@Request() req: any, @Body() dto: CreateExamScheduleDto) {
    return this.examsService.createSchedule(req.user.tenantId, dto);
  }

  // 5. Marks Entry
  @Get('schedules/:scheduleId/marks')
  @ApiOperation({ summary: 'Get student marks roster for an exam schedule' })
  getMarksBySchedule(@Request() req: any, @Param('scheduleId') scheduleId: string) {
    return this.examsService.getMarksBySchedule(req.user.tenantId, scheduleId);
  }

  @Post('marks/submit')
  @ApiOperation({ summary: 'Submit student marks in bulk' })
  submitMarks(@Request() req: any, @Body() dto: SubmitMarksDto) {
    return this.examsService.submitMarks(req.user.tenantId, req.user.staffId || req.user.id, dto);
  }

  // 6. Results Calculation & Publishing
  @Post('results/calculate')
  @ApiOperation({ summary: 'Calculate exam results and rankings for an exam' })
  calculateResults(@Request() req: any, @Body() dto: CalculateResultsDto) {
    return this.examsService.calculateExamResults(req.user.tenantId, dto);
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'List compiled results for an exam' })
  getExamResults(
    @Request() req: any,
    @Param('id') id: string,
    @Query('classId') classId?: string,
    @Query('sectionId') sectionId?: string,
  ) {
    return this.examsService.getExamResults(req.user.tenantId, id, classId, sectionId);
  }

  @Get(':id/report-card/:studentId')
  @ApiOperation({ summary: 'Get full student report card' })
  getStudentReportCard(
    @Request() req: any,
    @Param('id') id: string,
    @Param('studentId') studentId: string,
  ) {
    return this.examsService.getStudentReportCard(req.user.tenantId, id, studentId);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish exam results to student/parent portal' })
  publishResults(@Request() req: any, @Param('id') id: string) {
    return this.examsService.publishResults(req.user.tenantId, id);
  }
}
