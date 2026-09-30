import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  IsInt,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HolidayType } from '../../../common/enums/status.enum';

export class CreateHolidayDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  academicYearId?: string;

  @ApiProperty({ example: 'Independence Day' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ enum: HolidayType, example: HolidayType.NATIONAL })
  @IsEnum(HolidayType)
  @IsOptional()
  holidayType?: HolidayType;

  @ApiProperty({ example: '2025-08-15' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2025-08-15' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  totalDays?: number;

  @ApiPropertyOptional({ example: 'National holiday celebration' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;
}

export class UpdateHolidayDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ enum: HolidayType })
  @IsEnum(HolidayType)
  @IsOptional()
  holidayType?: HolidayType;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  totalDays?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;
}
