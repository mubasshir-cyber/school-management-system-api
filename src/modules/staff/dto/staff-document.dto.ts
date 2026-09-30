import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StaffDocumentType } from '../entities/staff-document.entity';

export class CreateStaffDocumentDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  @IsNotEmpty()
  staffId: string;

  @ApiProperty({ enum: StaffDocumentType, example: StaffDocumentType.DEGREE_CERTIFICATE })
  @IsEnum(StaffDocumentType)
  @IsNotEmpty()
  documentType: StaffDocumentType;

  @ApiProperty({ example: 'Master Degree Certificate' })
  @IsString()
  @IsNotEmpty()
  documentName: string;

  @ApiPropertyOptional({ example: 'DEG-2015-8833' })
  @IsString()
  @IsOptional()
  documentNumber?: string;

  @ApiProperty({ example: 'https://storage.school.edu/docs/staff-degree.pdf' })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({ example: 'degree_certificate.pdf' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiPropertyOptional({ example: 1048576 })
  @IsInt()
  @IsOptional()
  fileSize?: number;

  @ApiPropertyOptional({ example: '2015-06-20' })
  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  expiryDate?: string;
}

export class VerifyStaffDocumentDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  isVerified: boolean;
}
