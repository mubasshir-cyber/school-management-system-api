import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommonStatus } from '../../../common/enums/status.enum';

export class CreateClassDto {
  @ApiProperty({ description: 'Academic Year UUID' })
  @IsUUID('4')
  @IsNotEmpty()
  academicYearId: string;

  @ApiProperty({ example: 'Grade 10' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'G10' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 10, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  level?: number;

  @ApiPropertyOptional({ example: 1, default: 0 })
  @IsInt()
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({ example: 120, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  capacity?: number;
}

export class UpdateClassDto {
  @ApiPropertyOptional({ example: 'Grade 10' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsInt()
  @Min(1)
  @IsOptional()
  level?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsInt()
  @Min(0)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({ enum: CommonStatus })
  @IsEnum(CommonStatus)
  @IsOptional()
  status?: CommonStatus;
}
