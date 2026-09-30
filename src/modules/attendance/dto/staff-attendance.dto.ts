import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '../../../common/enums/status.enum';

export class StaffAttendanceItemDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  @IsNotEmpty()
  staffId: string;

  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status: AttendanceStatus;

  @ApiPropertyOptional({ example: '2025-07-15T08:30:00.000Z' })
  @IsDateString()
  @IsOptional()
  checkInTime?: string;

  @ApiPropertyOptional({ example: '2025-07-15T16:30:00.000Z' })
  @IsDateString()
  @IsOptional()
  checkOutTime?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isLate?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isHalfDay?: boolean;

  @ApiPropertyOptional({ example: 'Regular on-time check-in' })
  @IsString()
  @IsOptional()
  remarks?: string;
}

export class BulkSaveStaffAttendanceDto {
  @ApiProperty({ example: '2025-07-15' })
  @IsDateString()
  @IsNotEmpty()
  attendanceDate: string;

  @ApiProperty({ type: [StaffAttendanceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StaffAttendanceItemDto)
  records: StaffAttendanceItemDto[];
}

export class StaffAttendanceQueryDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ example: '2025-07-15' })
  @IsDateString()
  @IsOptional()
  attendanceDate?: string;

  @ApiPropertyOptional({ example: '2025-07-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-07-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  staffId?: string;
}
