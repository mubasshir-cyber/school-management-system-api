import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommonStatus } from '../../../common/enums/status.enum';

export class AssignTeacherToClassDto {
  @ApiProperty({ description: 'Academic Year UUID' })
  @IsUUID('4')
  @IsNotEmpty()
  academicYearId: string;

  @ApiProperty({ description: 'Teacher User UUID' })
  @IsUUID('4')
  @IsNotEmpty()
  teacherId: string;

  @ApiProperty({ description: 'Class UUID' })
  @IsUUID('4')
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ description: 'Section UUID' })
  @IsUUID('4')
  @IsNotEmpty()
  sectionId: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isClassTeacher?: boolean;

  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2027-03-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Branch UUID' })
  @IsUUID('4')
  @IsOptional()
  branchId?: string;
}

export class AssignTeacherToSubjectDto {
  @ApiProperty({ description: 'Academic Year UUID' })
  @IsUUID('4')
  @IsNotEmpty()
  academicYearId: string;

  @ApiProperty({ description: 'Teacher User UUID' })
  @IsUUID('4')
  @IsNotEmpty()
  teacherId: string;

  @ApiProperty({ description: 'Class UUID' })
  @IsUUID('4')
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ description: 'Section UUID' })
  @IsUUID('4')
  @IsNotEmpty()
  sectionId: string;

  @ApiProperty({ description: 'Subject UUID' })
  @IsUUID('4')
  @IsNotEmpty()
  subjectId: string;

  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2027-03-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Branch UUID' })
  @IsUUID('4')
  @IsOptional()
  branchId?: string;
}
