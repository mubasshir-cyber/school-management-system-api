import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveCategory } from '../../../common/enums/status.enum';

export class CreateLeaveTypeDto {
  @ApiProperty({ example: 'Casual Leave' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'CL' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ enum: LeaveCategory, example: LeaveCategory.CASUAL })
  @IsEnum(LeaveCategory)
  @IsOptional()
  category?: LeaveCategory;

  @ApiPropertyOptional({ example: 12 })
  @IsInt()
  @Min(0)
  @IsOptional()
  daysAllowedPerYear?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isCarryForward?: boolean;

  @ApiPropertyOptional({ example: 'Allocated 1 day per month' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateLeaveTypeDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ enum: LeaveCategory })
  @IsEnum(LeaveCategory)
  @IsOptional()
  category?: LeaveCategory;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  daysAllowedPerYear?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPaid?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isCarryForward?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsString()
  @IsOptional()
  status?: string;
}
