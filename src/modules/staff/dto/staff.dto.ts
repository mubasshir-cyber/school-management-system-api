import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEmail,
  IsEnum,
  IsNumber,
  Min,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmploymentType, StaffStatus } from '../entities/staff.entity';

export class CreateStaffDto {
  @ApiPropertyOptional({ example: 'EMP-2026-0001' })
  @IsString()
  @IsOptional()
  employeeCode?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  designationId?: string;

  @ApiProperty({ example: 'Brandon' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiProperty({ example: 'Sephton' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'brandon.sephton@school.edu' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+91 98765 43210' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  alternatePhone?: string;

  @ApiProperty({ example: 'Male' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({ example: '1988-04-15' })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiPropertyOptional({ example: '2022-06-01' })
  @IsDateString()
  @IsOptional()
  dateOfJoining?: string;

  @ApiPropertyOptional({ enum: EmploymentType, example: EmploymentType.FULL_TIME })
  @IsEnum(EmploymentType)
  @IsOptional()
  employmentType?: EmploymentType;

  @ApiPropertyOptional({ example: 'M.Sc. Mathematics, B.Ed.' })
  @IsString()
  @IsOptional()
  qualification?: string;

  @ApiPropertyOptional({ example: 8.5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  experienceYears?: number;

  @ApiPropertyOptional({ example: 'Married' })
  @IsString()
  @IsOptional()
  maritalStatus?: string;

  @ApiPropertyOptional({ example: 'O+' })
  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @ApiPropertyOptional({ example: 'Sarah Sephton' })
  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @ApiPropertyOptional({ example: '+91 98765 00000' })
  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;

  @ApiPropertyOptional({ example: 'Spouse' })
  @IsString()
  @IsOptional()
  emergencyContactRelationship?: string;

  @ApiPropertyOptional({ example: '456 College Avenue, Mumbai' })
  @IsString()
  @IsOptional()
  currentAddress?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  permanentAddress?: string;

  @ApiPropertyOptional({ example: 'Brandon Sephton' })
  @IsString()
  @IsOptional()
  bankAccountTitle?: string;

  @ApiPropertyOptional({ example: 'HDFC Bank' })
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional({ example: '50100234567890' })
  @IsString()
  @IsOptional()
  bankAccountNumber?: string;

  @ApiPropertyOptional({ example: 'HDFC0001234' })
  @IsString()
  @IsOptional()
  bankIfscCode?: string;

  @ApiPropertyOptional({ example: 'ABCDE1234F' })
  @IsString()
  @IsOptional()
  panOrTaxId?: string;

  @ApiPropertyOptional({ example: '9988 7766 5544' })
  @IsString()
  @IsOptional()
  aadhaarOrNationalId?: string;

  @ApiPropertyOptional({ example: 65000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  basicSalary?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  createUserAccount?: boolean;

  @ApiPropertyOptional({ example: 'Teacher' })
  @IsString()
  @IsOptional()
  roleName?: string;
}

export class UpdateStaffDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  designationId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  alternatePhone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dateOfJoining?: string;

  @ApiPropertyOptional({ enum: EmploymentType })
  @IsEnum(EmploymentType)
  @IsOptional()
  employmentType?: EmploymentType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  qualification?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  experienceYears?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  maritalStatus?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bloodGroup?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  emergencyContactRelationship?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currentAddress?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  permanentAddress?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bankAccountTitle?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bankName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bankAccountNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bankIfscCode?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  panOrTaxId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  aadhaarOrNationalId?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  basicSalary?: number;

  @ApiPropertyOptional({ enum: StaffStatus })
  @IsEnum(StaffStatus)
  @IsOptional()
  status?: StaffStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  photoUrl?: string;
}

export class StaffQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  designationId?: string;

  @ApiPropertyOptional({ enum: EmploymentType })
  @IsEnum(EmploymentType)
  @IsOptional()
  employmentType?: EmploymentType;

  @ApiPropertyOptional({ enum: StaffStatus })
  @IsEnum(StaffStatus)
  @IsOptional()
  status?: StaffStatus;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  limit?: number;
}
