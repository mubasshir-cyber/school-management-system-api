import { IsString, IsNotEmpty, IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExamStatus } from '../exams.enums';

export class CreateExamDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12' })
  @IsUUID()
  @IsNotEmpty()
  examTypeId: string;

  @ApiPropertyOptional({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13' })
  @IsUUID()
  @IsOptional()
  gradingScaleId?: string;

  @ApiProperty({ example: 'Half-Yearly Examination 2026-27' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Mid-session summative assessment' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2026-10-15' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-10-28' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({ enum: ExamStatus, default: ExamStatus.DRAFT })
  @IsEnum(ExamStatus)
  @IsOptional()
  status?: ExamStatus;
}
