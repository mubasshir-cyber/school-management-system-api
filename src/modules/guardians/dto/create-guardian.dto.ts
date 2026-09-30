import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GuardianRelationshipType } from '../../../common/enums/status.enum';

export class CreateGuardianDto {
  @ApiProperty({ example: 'Rashid' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiPropertyOptional({ example: 'Ahmed' })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ example: 'Khan' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ enum: GuardianRelationshipType, default: GuardianRelationshipType.FATHER })
  @IsOptional()
  @IsEnum(GuardianRelationshipType)
  relationshipType?: GuardianRelationshipType;

  @ApiProperty({ example: '+91 9876543210' })
  @IsNotEmpty()
  @IsString()
  mobile: string;

  @ApiPropertyOptional({ example: '+91 9876543211' })
  @IsOptional()
  @IsString()
  alternateMobile?: string;

  @ApiPropertyOptional({ example: 'rashid.khan@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Software Engineer' })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional({ example: 'Tech Corp' })
  @IsOptional()
  @IsString()
  employer?: string;

  @ApiPropertyOptional({ example: 1200000 })
  @IsOptional()
  @IsNumber()
  annualIncome?: number;

  @ApiPropertyOptional({ example: 'Aadhaar' })
  @IsOptional()
  @IsString()
  governmentIdType?: string;

  @ApiPropertyOptional({ example: '9876-5432-1098' })
  @IsOptional()
  @IsString()
  governmentIdNumber?: string;

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

  @ApiPropertyOptional({ example: 'b0e00000-0000-0000-0000-000000000000' })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
