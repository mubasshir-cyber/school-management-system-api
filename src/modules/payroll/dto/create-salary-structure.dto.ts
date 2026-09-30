import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SalaryCalculationType } from '../entities/salary-component.entity';

export class SalaryStructureItemDto {
  @IsNotEmpty()
  @IsUUID()
  salaryComponentId: string;

  @IsOptional()
  @IsEnum(SalaryCalculationType)
  calculationType?: SalaryCalculationType;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  value: number;
}

export class CreateSalaryStructureDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalaryStructureItemDto)
  items: SalaryStructureItemDto[];
}

export class UpdateSalaryStructureDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalaryStructureItemDto)
  items?: SalaryStructureItemDto[];
}
