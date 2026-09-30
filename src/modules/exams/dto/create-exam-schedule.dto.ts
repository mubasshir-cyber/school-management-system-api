import { IsString, IsNotEmpty, IsOptional, IsUUID, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExamScheduleDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsUUID()
  @IsNotEmpty()
  examId: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12' })
  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @ApiPropertyOptional({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13' })
  @IsUUID()
  @IsOptional()
  sectionId?: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14' })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ example: '2026-10-16' })
  @IsDateString()
  @IsNotEmpty()
  examDate: string;

  @ApiProperty({ example: '09:00:00' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '12:00:00' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiPropertyOptional({ example: 'Hall A-102' })
  @IsString()
  @IsOptional()
  roomNumber?: string;

  @ApiPropertyOptional({ example: 100.0 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxMarks?: number;

  @ApiPropertyOptional({ example: 35.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  passMarks?: number;

  @ApiPropertyOptional({ example: 80.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  theoryMaxMarks?: number;

  @ApiPropertyOptional({ example: 20.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  practicalMaxMarks?: number;

  @ApiPropertyOptional({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15' })
  @IsUUID()
  @IsOptional()
  invigilatorStaffId?: string;
}
