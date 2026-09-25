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
import { AcademicYearsService } from './academic-years.service';
import { CreateAcademicYearDto, UpdateAcademicYearDto } from './dto/academic-year.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Academic Structure')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('academic-years')
export class AcademicYearsController {
  constructor(private readonly academicYearsService: AcademicYearsService) {}

  @Post()
  @RequirePermissions('academic.year.create')
  @ApiOperation({ summary: 'Create a new academic year' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Body() dto: CreateAcademicYearDto,
  ) {
    return this.academicYearsService.create(tenantId, schoolId, dto);
  }

  @Get()
  @RequirePermissions('academic.year.read')
  @ApiOperation({ summary: 'List all academic years for current school' })
  findAll(@CurrentUser('schoolId') schoolId: string) {
    return this.academicYearsService.findAll(schoolId);
  }

  @Get('current')
  @RequirePermissions('academic.year.read')
  @ApiOperation({ summary: 'Get current active academic year' })
  getCurrent(@CurrentUser('schoolId') schoolId: string) {
    return this.academicYearsService.getCurrent(schoolId);
  }

  @Get(':id')
  @RequirePermissions('academic.year.read')
  @ApiOperation({ summary: 'Get academic year by ID' })
  findOne(@Param('id') id: string) {
    return this.academicYearsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('academic.year.update')
  @ApiOperation({ summary: 'Update academic year details' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAcademicYearDto,
  ) {
    return this.academicYearsService.update(id, dto);
  }

  @Post(':id/set-current')
  @RequirePermissions('academic.year.update')
  @ApiOperation({ summary: 'Set this academic year as active current year' })
  setCurrent(@Param('id') id: string) {
    return this.academicYearsService.setCurrent(id);
  }

  @Post(':id/close')
  @RequirePermissions('academic.year.update')
  @ApiOperation({ summary: 'Close and archive academic year' })
  closeYear(@Param('id') id: string) {
    return this.academicYearsService.closeYear(id);
  }

  @Delete(':id')
  @RequirePermissions('academic.year.delete')
  @ApiOperation({ summary: 'Soft delete academic year' })
  remove(@Param('id') id: string) {
    return this.academicYearsService.remove(id);
  }
}
