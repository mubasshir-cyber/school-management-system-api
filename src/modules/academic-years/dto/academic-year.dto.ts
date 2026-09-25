import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommonStatus } from '../../../common/enums/status.enum';

export class CreateAcademicYearDto {
  @ApiProperty({ example: '2026-27' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'AY-2026-27' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: '2026-04-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2027-03-31' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;
}

export class UpdateAcademicYearDto {
  @ApiPropertyOptional({ example: '2026-27' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2027-03-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ enum: CommonStatus })
  @IsEnum(CommonStatus)
  @IsOptional()
  status?: CommonStatus;
}
