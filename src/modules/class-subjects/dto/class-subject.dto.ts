import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignSubjectToClassDto {
  @ApiProperty({ description: 'Academic Year UUID' })
  @IsUUID('4')
  @IsNotEmpty()
  academicYearId: string;

  @ApiProperty({ description: 'Class UUID' })
  @IsUUID('4')
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ description: 'Subject UUID' })
  @IsUUID('4')
  @IsNotEmpty()
  subjectId: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @IsOptional()
  displayOrder?: number;
}

export class BulkAssignSubjectsDto {
  @ApiProperty({ description: 'Academic Year UUID' })
  @IsUUID('4')
  @IsNotEmpty()
  academicYearId: string;

  @ApiProperty({ description: 'Class UUID' })
  @IsUUID('4')
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ type: [String], description: 'Array of Subject UUIDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  subjectIds: string[];
}
