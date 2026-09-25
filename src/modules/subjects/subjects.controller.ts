import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto, UpdateSubjectDto } from './dto/subject.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Academic Structure')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @RequirePermissions('subject.create')
  @ApiOperation({ summary: 'Create a new subject' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Body() dto: CreateSubjectDto,
  ) {
    return this.subjectsService.create(tenantId, schoolId, dto);
  }

  @Get()
  @RequirePermissions('subject.read')
  @ApiOperation({ summary: 'List all subjects for current school' })
  findAll(@CurrentUser('schoolId') schoolId: string) {
    return this.subjectsService.findAll(schoolId);
  }

  @Get(':id')
  @RequirePermissions('subject.read')
  @ApiOperation({ summary: 'Get subject details by ID' })
  findOne(@Param('id') id: string) {
    return this.subjectsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('subject.update')
  @ApiOperation({ summary: 'Update subject rules and passing marks' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.subjectsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('subject.delete')
  @ApiOperation({ summary: 'Soft delete subject' })
  remove(@Param('id') id: string) {
    return this.subjectsService.remove(id);
  }
}
