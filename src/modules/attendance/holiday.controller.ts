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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { HolidayService } from './holiday.service';
import { CreateHolidayDto, UpdateHolidayDto } from './dto/holiday.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Holidays')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('holidays')
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @Post()
  @RequirePermissions('attendance.holiday.manage')
  @ApiOperation({ summary: 'Create a new school holiday or vacation event' })
  @ApiResponse({ status: 201, description: 'Holiday created successfully' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateHolidayDto,
  ) {
    return this.holidayService.create(tenantId, schoolId, dto, userId);
  }

  @Get()
  @RequirePermissions('attendance.student.read')
  @ApiOperation({ summary: 'Get all holidays for school' })
  @ApiQuery({ name: 'academicYearId', required: false, type: String })
  findAll(
    @CurrentUser('schoolId') schoolId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.holidayService.findAll(schoolId, academicYearId);
  }

  @Get(':id')
  @RequirePermissions('attendance.student.read')
  @ApiOperation({ summary: 'Get holiday details by ID' })
  findOne(
    @CurrentUser('schoolId') schoolId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.holidayService.findOne(schoolId, id);
  }

  @Patch(':id')
  @RequirePermissions('attendance.holiday.manage')
  @ApiOperation({ summary: 'Update holiday details' })
  update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHolidayDto,
  ) {
    return this.holidayService.update(tenantId, schoolId, id, dto, userId);
  }

  @Delete(':id')
  @RequirePermissions('attendance.holiday.manage')
  @ApiOperation({ summary: 'Delete holiday (Soft delete)' })
  remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.holidayService.remove(tenantId, schoolId, id, userId);
  }
}
