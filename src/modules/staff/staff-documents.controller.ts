import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StaffDocumentsService } from './staff-documents.service';
import { CreateStaffDocumentDto, VerifyStaffDocumentDto } from './dto/staff-document.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Staff Documents')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('staff-documents')
export class StaffDocumentsController {
  constructor(private readonly documentsService: StaffDocumentsService) {}

  @Post()
  @RequirePermissions('staff.document.manage')
  @ApiOperation({ summary: 'Upload a staff document' })
  @ApiResponse({ status: 201, description: 'Staff document recorded' })
  create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() createDto: CreateStaffDocumentDto,
  ) {
    return this.documentsService.create(tenantId, schoolId, createDto, userId);
  }

  @Get('staff/:staffId')
  @RequirePermissions('staff.profile.read')
  @ApiOperation({ summary: 'Get all documents for a specific staff member' })
  findByStaff(
    @CurrentUser('schoolId') schoolId: string,
    @Param('staffId', ParseUUIDPipe) staffId: string,
  ) {
    return this.documentsService.findByStaff(schoolId, staffId);
  }

  @Patch(':id/verify')
  @RequirePermissions('staff.document.manage')
  @ApiOperation({ summary: 'Verify or unverify a staff document' })
  verifyDocument(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() verifyDto: VerifyStaffDocumentDto,
  ) {
    return this.documentsService.verifyDocument(tenantId, schoolId, id, verifyDto, userId);
  }

  @Delete(':id')
  @RequirePermissions('staff.document.manage')
  @ApiOperation({ summary: 'Delete a staff document' })
  remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.documentsService.remove(tenantId, schoolId, id, userId);
  }
}
