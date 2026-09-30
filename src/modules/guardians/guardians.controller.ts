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
import { GuardiansService } from './guardians.service';
import { CreateGuardianDto } from './dto/create-guardian.dto';
import { UpdateGuardianDto } from './dto/update-guardian.dto';
import { LinkGuardianDto } from './dto/link-guardian.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Guardians')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class GuardiansController {
  constructor(private readonly guardiansService: GuardiansService) {}

  @Post('guardians')
  @RequirePermissions('guardian.profile.create')
  @ApiOperation({ summary: 'Create a new guardian record' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateGuardianDto,
  ) {
    const guardian = await this.guardiansService.create(tenantId, schoolId, branchId, dto, userId);
    return {
      success: true,
      message: 'Guardian created successfully',
      data: guardian,
    };
  }

  @Get('guardians')
  @RequirePermissions('guardian.profile.read')
  @ApiOperation({ summary: 'List all guardians with optional search' })
  async findAll(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Query('search') search?: string,
  ) {
    const guardians = await this.guardiansService.findAll(tenantId, schoolId, search);
    return {
      success: true,
      data: guardians,
    };
  }

  @Get('guardians/:id')
  @RequirePermissions('guardian.profile.read')
  @ApiOperation({ summary: 'Get guardian details and linked students' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const guardian = await this.guardiansService.findOne(tenantId, schoolId, id);
    return {
      success: true,
      data: guardian,
    };
  }

  @Patch('guardians/:id')
  @RequirePermissions('guardian.profile.update')
  @ApiOperation({ summary: 'Update guardian details' })
  async update(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGuardianDto,
  ) {
    const updated = await this.guardiansService.update(tenantId, schoolId, id, dto, userId);
    return {
      success: true,
      message: 'Guardian updated successfully',
      data: updated,
    };
  }

  @Delete('guardians/:id')
  @RequirePermissions('guardian.profile.delete')
  @ApiOperation({ summary: 'Soft-delete guardian record' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.guardiansService.remove(tenantId, schoolId, id, userId);
    return {
      success: true,
      message: 'Guardian deleted successfully',
    };
  }

  @Post('students/:studentId/guardians')
  @RequirePermissions('student.profile.update')
  @ApiOperation({ summary: 'Link an existing guardian to a student' })
  async linkGuardian(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('userId') userId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Body() dto: LinkGuardianDto,
  ) {
    const link = await this.guardiansService.linkGuardianToStudent(
      tenantId,
      schoolId,
      branchId,
      studentId,
      dto,
      userId,
    );
    return {
      success: true,
      message: 'Guardian linked to student successfully',
      data: link,
    };
  }

  @Patch('students/:studentId/guardians/:guardianId')
  @RequirePermissions('student.profile.update')
  @ApiOperation({ summary: 'Update student-guardian relationship flags' })
  async updateLink(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Param('guardianId', ParseUUIDPipe) guardianId: string,
    @Body() dto: Partial<LinkGuardianDto>,
  ) {
    const link = await this.guardiansService.updateStudentGuardianLink(
      tenantId,
      schoolId,
      studentId,
      guardianId,
      dto,
      userId,
    );
    return {
      success: true,
      message: 'Guardian relationship updated successfully',
      data: link,
    };
  }

  @Delete('students/:studentId/guardians/:guardianId')
  @RequirePermissions('student.profile.update')
  @ApiOperation({ summary: 'Unlink guardian from student' })
  async unlinkGuardian(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Param('guardianId', ParseUUIDPipe) guardianId: string,
  ) {
    await this.guardiansService.unlinkGuardianFromStudent(
      tenantId,
      schoolId,
      studentId,
      guardianId,
      userId,
    );
    return {
      success: true,
      message: 'Guardian unlinked successfully',
    };
  }
}
