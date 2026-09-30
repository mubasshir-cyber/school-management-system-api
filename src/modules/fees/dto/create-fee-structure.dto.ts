import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FeeFrequency } from '../entities/fee-structure.entity';

export class FeeStructureItemDto {
  @IsNotEmpty()
  @IsUUID()
  feeTypeId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsNumber()
  dueDayOfMonth?: number;

  @IsOptional()
  @IsNumber()
  lateFineAmount?: number;

  @IsOptional()
  @IsNumber()
  graceDays?: number;
}

export class CreateFeeStructureDto {
  @IsNotEmpty()
  @IsUUID()
  academicYearId: string;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsEnum(FeeFrequency)
  frequency?: FeeFrequency;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeeStructureItemDto)
  items: FeeStructureItemDto[];
}

export class UpdateFeeStructureDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsEnum(FeeFrequency)
  frequency?: FeeFrequency;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeeStructureItemDto)
  items?: FeeStructureItemDto[];
}
