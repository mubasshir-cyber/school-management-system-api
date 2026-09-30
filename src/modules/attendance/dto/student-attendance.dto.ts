import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus } from '../../../common/enums/status.enum';

export class StudentAttendanceItemDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ enum: AttendanceStatus, example: AttendanceStatus.PRESENT })
  @IsEnum(AttendanceStatus)
  @IsNotEmpty()
  status: AttendanceStatus;

  @ApiPropertyOptional({ example: 'Late by 10 mins' })
  @IsString()
  @IsOptional()
  remarks?: string;
}

export class BulkSaveStudentAttendanceDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  @IsNotEmpty()
  sectionId: string;

  @ApiProperty({ example: '2025-07-15' })
  @IsDateString()
  @IsNotEmpty()
  attendanceDate: string;

  @ApiProperty({ type: [StudentAttendanceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceItemDto)
  records: StudentAttendanceItemDto[];
}

export class StudentAttendanceQueryDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  classId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  sectionId?: string;

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
  studentId?: string;
}
