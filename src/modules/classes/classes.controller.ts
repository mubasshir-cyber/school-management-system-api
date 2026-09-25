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
import { ClassesService } from './classes.service';
import { CreateClassDto, UpdateClassDto } from './dto/class.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Academic Structure')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  @RequirePermissions('class.create')
  @ApiOperation({ summary: 'Create a new class / standard' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Body() dto: CreateClassDto,
  ) {
    return this.classesService.create(tenantId, schoolId, dto);
  }

  @Get()
  @RequirePermissions('class.read')
  @ApiOperation({ summary: 'List classes for school and optional academic year' })
  findAll(
    @CurrentUser('schoolId') schoolId: string,
    @Query('academicYearId') academicYearId?: string,
  ) {
    return this.classesService.findAll(schoolId, academicYearId);
  }

  @Get(':id')
  @RequirePermissions('class.read')
  @ApiOperation({ summary: 'Get class details by ID' })
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('class.update')
  @ApiOperation({ summary: 'Update class details' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClassDto,
  ) {
    return this.classesService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('class.delete')
  @ApiOperation({ summary: 'Soft delete class' })
  remove(@Param('id') id: string) {
    return this.classesService.remove(id);
  }
}
