import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { CreateSectionDto, UpdateSectionDto } from './dto/section.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Academic Structure')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @RequirePermissions('section.create')
  @ApiOperation({ summary: 'Create a new section under a class' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Body() dto: CreateSectionDto,
  ) {
    return this.sectionsService.create(tenantId, schoolId, dto);
  }

  @Get()
  @RequirePermissions('section.read')
  @ApiOperation({ summary: 'List sections for a school, class, and academic year' })
  findAll(
    @CurrentUser('schoolId') schoolId: string,
    @Query('classId') classId?: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.sectionsService.findAll(schoolId, classId, academicYearId);
  }

  @Get(':id')
  @RequirePermissions('section.read')
  @ApiOperation({ summary: 'Get section details by ID' })
  findOne(@Param('id') id: string) {
    return this.sectionsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('section.update')
  @ApiOperation({ summary: 'Update section details or assigned class teacher' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.sectionsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('section.delete')
  @ApiOperation({ summary: 'Soft delete section' })
  remove(@Param('id') id: string) {
    return this.sectionsService.remove(id);
  }
}
