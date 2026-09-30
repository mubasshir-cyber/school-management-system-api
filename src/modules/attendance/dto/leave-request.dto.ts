import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveStatus } from '../../../common/enums/status.enum';

export class CreateLeaveRequestDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  staffId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  studentId?: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  @IsNotEmpty()
  leaveTypeId: string;

  @ApiProperty({ example: '2025-07-20' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2025-07-22' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @Min(0.5)
  @IsNotEmpty()
  totalDays: number;

  @ApiProperty({ example: 'Attending family medical appointment' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ example: 'https://storage.school.edu/docs/medical_leave.pdf' })
  @IsString()
  @IsOptional()
  documentUrl?: string;
}

export class ReviewLeaveRequestDto {
  @ApiProperty({ enum: LeaveStatus, example: LeaveStatus.APPROVED })
  @IsEnum(LeaveStatus)
  @IsNotEmpty()
  status: LeaveStatus;

  @ApiPropertyOptional({ example: 'Approved by Principal' })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}

export class LeaveRequestQueryDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  staffId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  studentId?: string;

  @ApiPropertyOptional({ enum: LeaveStatus })
  @IsEnum(LeaveStatus)
  @IsOptional()
  status?: LeaveStatus;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  limit?: number;
}
