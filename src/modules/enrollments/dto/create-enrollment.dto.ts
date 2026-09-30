import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { EnrollmentStatus } from '../../../common/enums/status.enum';

export class CreateEnrollmentDto {
  @ApiProperty({ example: 's0e00000-0000-0000-0000-000000000000' })
  @IsNotEmpty()
  @IsUUID()
  studentId: string;

  @ApiProperty({ example: 'a0e00000-0000-0000-0000-000000000000' })
  @IsNotEmpty()
  @IsUUID()
  academicYearId: string;

  @ApiProperty({ example: 'c0e00000-0000-0000-0000-000000000000' })
  @IsNotEmpty()
  @IsUUID()
  classId: string;

  @ApiProperty({ example: 'sec00000-0000-0000-0000-000000000000' })
  @IsNotEmpty()
  @IsUUID()
  sectionId: string;

  @ApiPropertyOptional({ example: '14' })
  @IsOptional()
  @IsString()
  rollNumber?: string;

  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsOptional()
  @IsDateString()
  enrollmentDate?: string;

  @ApiPropertyOptional({ enum: EnrollmentStatus, default: EnrollmentStatus.ACTIVE })
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: 'b0e00000-0000-0000-0000-000000000000' })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class UpdateEnrollmentDto extends PartialType(CreateEnrollmentDto) {}

export class TransferEnrollmentDto {
  @ApiProperty({ example: 'c0e00000-0000-0000-0000-000000000000' })
  @IsNotEmpty()
  @IsUUID()
  targetClassId: string;

  @ApiProperty({ example: 'sec00000-0000-0000-0000-000000000000' })
  @IsNotEmpty()
  @IsUUID()
  targetSectionId: string;

  @ApiPropertyOptional({ example: '18' })
  @IsOptional()
  @IsString()
  newRollNumber?: string;

  @ApiPropertyOptional({ example: 'Section adjustment based on capacity' })
  @IsOptional()
  @IsString()
  reason?: string;
}
