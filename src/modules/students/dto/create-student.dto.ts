import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsEmail,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StudentStatus } from '../../../common/enums/status.enum';

export class CreateStudentDto {
  @ApiProperty({ example: 'STU-2026-000001', required: false })
  @IsOptional()
  @IsString()
  studentCode?: string;

  @ApiPropertyOptional({ example: 'ADM-2026-000045' })
  @IsOptional()
  @IsString()
  admissionNumber?: string;

  @ApiProperty({ example: 'Ahmed' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiPropertyOptional({ example: 'Ali' })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ example: 'Khan' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: '2015-05-12' })
  @IsNotEmpty()
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: 'Male' })
  @IsNotEmpty()
  @IsString()
  gender: string;

  @ApiPropertyOptional({ example: 'O+' })
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @ApiPropertyOptional({ example: 'Indian' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ example: 'General' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'Aadhaar' })
  @IsOptional()
  @IsString()
  governmentIdType?: string;

  @ApiPropertyOptional({ example: '1234-5678-9012' })
  @IsOptional()
  @IsString()
  governmentIdNumber?: string;

  @ApiPropertyOptional({ example: '+91 9876543210' })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional({ example: 'ahmed.khan@school.edu' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Flat 402, Green Heights' })
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiPropertyOptional({ example: 'Sector 14' })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiPropertyOptional({ example: 'New Delhi' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Delhi' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: 'India' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '110001' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ example: 'https://storage.school.edu/photos/stu1.jpg' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ enum: StudentStatus, default: StudentStatus.REGISTERED })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;

  @ApiPropertyOptional({ example: 'b0e00000-0000-0000-0000-000000000000' })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
