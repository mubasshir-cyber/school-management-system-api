import { IsNotEmpty, IsString, IsEnum, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { SalaryComponentType, SalaryCalculationType } from '../entities/salary-component.entity';

export class CreateSalaryComponentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsEnum(SalaryComponentType)
  componentType: SalaryComponentType;

  @IsOptional()
  @IsEnum(SalaryCalculationType)
  calculationType?: SalaryCalculationType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultValue?: number;

  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;

  @IsOptional()
  @IsBoolean()
  isStatutory?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateSalaryComponentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsEnum(SalaryComponentType)
  componentType?: SalaryComponentType;

  @IsOptional()
  @IsEnum(SalaryCalculationType)
  calculationType?: SalaryCalculationType;

  @IsOptional()
  @IsNumber()
  defaultValue?: number;

  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;

  @IsOptional()
  @IsBoolean()
  isStatutory?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
