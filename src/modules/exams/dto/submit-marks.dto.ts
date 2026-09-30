import { IsUUID, IsNotEmpty, IsArray, ValidateNested, IsNumber, Min, IsOptional, IsBoolean, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StudentMarkStatus } from '../exams.enums';

export class StudentMarkItemDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiPropertyOptional({ example: 68.5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  theoryMarks?: number;

  @ApiPropertyOptional({ example: 18.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  practicalMarks?: number;

  @ApiPropertyOptional({ example: 0.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  internalMarks?: number;

  @ApiPropertyOptional({ example: 86.5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalMarks?: number;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isAbsent?: boolean;

  @ApiPropertyOptional({ example: 'Excellent analytical skills' })
  @IsString()
  @IsOptional()
  remarks?: string;
}

export class SubmitMarksDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22' })
  @IsUUID()
  @IsNotEmpty()
  examScheduleId: string;

  @ApiProperty({ type: [StudentMarkItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentMarkItemDto)
  marks: StudentMarkItemDto[];

  @ApiPropertyOptional({ enum: StudentMarkStatus, default: StudentMarkStatus.SUBMITTED })
  @IsEnum(StudentMarkStatus)
  @IsOptional()
  status?: StudentMarkStatus;
}
