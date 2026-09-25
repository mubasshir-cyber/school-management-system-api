import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubjectType } from '../../../common/enums/subject-type.enum';
import { CommonStatus } from '../../../common/enums/status.enum';

export class CreateSubjectDto {
  @ApiProperty({ example: 'Mathematics' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'MATH-101' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ enum: SubjectType, default: SubjectType.CORE })
  @IsEnum(SubjectType)
  @IsOptional()
  type?: SubjectType;

  @ApiPropertyOptional({ example: 100, default: 100 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  theoryMaxMarks?: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  practicalMaxMarks?: number;

  @ApiPropertyOptional({ example: 35, default: 35 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  passingMarks?: number;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isGradeBased?: boolean;

  @ApiPropertyOptional({ example: 1.0, default: 1.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  credit?: number;
}

export class UpdateSubjectDto {
  @ApiPropertyOptional({ example: 'Advanced Mathematics' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ enum: SubjectType })
  @IsEnum(SubjectType)
  @IsOptional()
  type?: SubjectType;

  @ApiPropertyOptional({ example: 80 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  theoryMaxMarks?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  practicalMaxMarks?: number;

  @ApiPropertyOptional({ example: 35 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  passingMarks?: number;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isGradeBased?: boolean;

  @ApiPropertyOptional({ example: 1.5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  credit?: number;

  @ApiPropertyOptional({ enum: CommonStatus })
  @IsEnum(CommonStatus)
  @IsOptional()
  status?: CommonStatus;
}
