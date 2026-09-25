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

export class CreateSectionDto {
  @ApiProperty({ description: 'Academic Year UUID' })
  @IsUUID('4')
  @IsNotEmpty()
  academicYearId: string;

  @ApiProperty({ description: 'Class UUID' })
  @IsUUID('4')
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ example: 'A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'SEC-A' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: 40, default: 40 })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({ example: 'Room 101' })
  @IsString()
  @IsOptional()
  roomNumber?: string;

  @ApiPropertyOptional({ description: 'Assigned Class Teacher User UUID' })
  @IsUUID('4')
  @IsOptional()
  classTeacherId?: string;

  @ApiPropertyOptional({ description: 'Branch UUID' })
  @IsUUID('4')
  @IsOptional()
  branchId?: string;
}

export class UpdateSectionDto {
  @ApiPropertyOptional({ example: 'A' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 45 })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({ example: 'Room 102' })
  @IsString()
  @IsOptional()
  roomNumber?: string;

  @ApiPropertyOptional({ description: 'Assigned Class Teacher User UUID' })
  @IsUUID('4')
  @IsOptional()
  classTeacherId?: string;

  @ApiPropertyOptional({ enum: CommonStatus })
  @IsEnum(CommonStatus)
  @IsOptional()
  status?: CommonStatus;
}
