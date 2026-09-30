import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsInt,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StudentDocumentType } from '../../../common/enums/status.enum';

export class CreateStudentDocumentDto {
  @ApiProperty({ example: 's0e00000-0000-0000-0000-000000000000' })
  @IsNotEmpty()
  @IsUUID()
  studentId: string;

  @ApiProperty({ enum: StudentDocumentType, example: StudentDocumentType.BIRTH_CERTIFICATE })
  @IsNotEmpty()
  @IsEnum(StudentDocumentType)
  documentType: StudentDocumentType;

  @ApiProperty({ example: 'Municipal Birth Certificate' })
  @IsNotEmpty()
  @IsString()
  documentName: string;

  @ApiPropertyOptional({ example: 'BC-2015-88990' })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiProperty({ example: 'https://storage.school.edu/docs/stu1_bc.pdf' })
  @IsNotEmpty()
  @IsString()
  fileUrl: string;

  @ApiProperty({ example: 'birth_certificate.pdf' })
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @ApiProperty({ example: 'application/pdf' })
  @IsNotEmpty()
  @IsString()
  mimeType: string;

  @ApiProperty({ example: 2048500 })
  @IsNotEmpty()
  @IsInt()
  fileSize: number;

  @ApiPropertyOptional({ example: '2015-06-01' })
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @ApiPropertyOptional({ example: '2030-06-01' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ example: 'b0e00000-0000-0000-0000-000000000000' })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class VerifyStudentDocumentDto {
  @ApiProperty({ default: true })
  @IsNotEmpty()
  @IsBoolean()
  isVerified: boolean;
}
