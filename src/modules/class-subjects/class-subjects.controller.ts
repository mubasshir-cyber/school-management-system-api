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
import { ClassSubjectsService } from './class-subjects.service';
import { AssignSubjectToClassDto, BulkAssignSubjectsDto } from './dto/class-subject.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Academic Structure')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('class-subjects')
export class ClassSubjectsController {
  constructor(private readonly classSubjectsService: ClassSubjectsService) {}

  @Post()
  @RequirePermissions('subject.create')
  @ApiOperation({ summary: 'Assign a subject to a class' })
  assignSubject(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Body() dto: AssignSubjectToClassDto,
  ) {
    return this.classSubjectsService.assignSubject(tenantId, schoolId, dto);
  }

  @Post('bulk')
  @RequirePermissions('subject.create')
  @ApiOperation({ summary: 'Bulk assign multiple subjects to a class' })
  bulkAssign(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Body() dto: BulkAssignSubjectsDto,
  ) {
    return this.classSubjectsService.bulkAssign(tenantId, schoolId, dto);
  }

  @Get()
  @RequirePermissions('subject.read')
  @ApiOperation({ summary: 'Get all subjects assigned to a class' })
  findByClass(@Query('classId') classId: string) {
    return this.classSubjectsService.findByClass(classId);
  }

  @Get(':id')
  @RequirePermissions('subject.read')
  @ApiOperation({ summary: 'Get class-subject mapping by ID' })
  findOne(@Param('id') id: string) {
    return this.classSubjectsService.findOne(id);
  }

  @Delete(':id')
  @RequirePermissions('subject.delete')
  @ApiOperation({ summary: 'Remove subject from class' })
  remove(@Param('id') id: string) {
    return this.classSubjectsService.remove(id);
  }
}
