import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommonStatus } from '../../../common/enums/status.enum';

export class CreateTenantDto {
  @ApiProperty({ example: 'Delhi Public Education Society' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'DPES' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: 'dpes.edu' })
  @IsString()
  @IsOptional()
  domain?: string;

  @ApiProperty({ example: 'admin@dpes.edu' })
  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @ApiPropertyOptional({ example: '+91 9876543210' })
  @IsString()
  @IsOptional()
  contactPhone?: string;
}

export class CreateSchoolDto {
  @ApiProperty({ example: 'Delhi Public School, R.K. Puram' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'DPS-RKP' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: 'CBSE' })
  @IsString()
  @IsOptional()
  board?: string;

  @ApiPropertyOptional({ example: 'English' })
  @IsString()
  @IsOptional()
  medium?: string;

  @ApiPropertyOptional({ example: 'Sector XII, R.K. Puram' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'New Delhi' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Delhi' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: '110022' })
  @IsString()
  @IsOptional()
  pincode?: string;

  @ApiPropertyOptional({ example: 'info@dpsrkp.net' })
  @IsEmail()
  @IsOptional()
  email?: string;
}

export class CreateBranchDto {
  @ApiProperty({ example: 'Junior Wing Campus' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'JW-01' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: 'Vasant Vihar' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'New Delhi' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isMainBranch?: boolean;
}
