import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StudentDocumentsService } from './student-documents.service';
import { CreateStudentDocumentDto, VerifyStudentDocumentDto } from './dto/create-student-document.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Student Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class StudentDocumentsController {
  constructor(private readonly documentsService: StudentDocumentsService) {}

  @Post('student-documents')
  @RequirePermissions('student.document.create')
  @ApiOperation({ summary: 'Upload / attach document to student record' })
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateStudentDocumentDto,
  ) {
    const document = await this.documentsService.create(tenantId, schoolId, branchId, dto, userId);
    return {
      success: true,
      message: 'Student document uploaded successfully',
      data: document,
    };
  }

  @Get('students/:studentId/documents')
  @RequirePermissions('student.document.read')
  @ApiOperation({ summary: 'Get all documents for a student' })
  async findByStudent(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ) {
    const docs = await this.documentsService.findByStudent(tenantId, schoolId, studentId);
    return {
      success: true,
      data: docs,
    };
  }

  @Get('student-documents/:id')
  @RequirePermissions('student.document.read')
  @ApiOperation({ summary: 'Get document details' })
  async findOne(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const doc = await this.documentsService.findOne(tenantId, schoolId, id);
    return {
      success: true,
      data: doc,
    };
  }

  @Post('student-documents/:id/verify')
  @RequirePermissions('student.document.verify')
  @ApiOperation({ summary: 'Verify or unverify a student document' })
  async verify(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyStudentDocumentDto,
  ) {
    const verified = await this.documentsService.verify(tenantId, schoolId, id, dto, userId);
    return {
      success: true,
      message: dto.isVerified ? 'Document verified successfully' : 'Document unverified',
      data: verified,
    };
  }

  @Delete('student-documents/:id')
  @RequirePermissions('student.document.delete')
  @ApiOperation({ summary: 'Soft-delete a student document' })
  async remove(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.documentsService.remove(tenantId, schoolId, id, userId);
    return {
      success: true,
      message: 'Student document deleted successfully',
    };
  }
}
