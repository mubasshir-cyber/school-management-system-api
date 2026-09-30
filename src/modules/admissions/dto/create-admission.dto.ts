import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAdmissionDto {
  @ApiProperty({ example: 'a0e00000-0000-0000-0000-000000000000' })
  @IsNotEmpty()
  @IsUUID()
  academicYearId: string;

  @ApiProperty({ example: 'c0e00000-0000-0000-0000-000000000000' })
  @IsNotEmpty()
  @IsUUID()
  classId: string;

  @ApiPropertyOptional({ example: 's0e00000-0000-0000-0000-000000000000' })
  @IsOptional()
  @IsUUID()
  preferredSectionId?: string;

  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsOptional()
  @IsDateString()
  applicationDate?: string;

  @ApiProperty({ example: 'Zayd' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Mansoor' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: '2016-08-20' })
  @IsNotEmpty()
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: 'Male' })
  @IsNotEmpty()
  @IsString()
  gender: string;

  @ApiProperty({ example: 'Mansoor Ali' })
  @IsNotEmpty()
  @IsString()
  guardianName: string;

  @ApiProperty({ example: '+91 9988776655' })
  @IsNotEmpty()
  @IsString()
  guardianMobile: string;

  @ApiPropertyOptional({ example: 'mansoor.ali@example.com' })
  @IsOptional()
  @IsEmail()
  guardianEmail?: string;

  @ApiPropertyOptional({ example: 'Special interest in robotics club' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'b0e00000-0000-0000-0000-000000000000' })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
