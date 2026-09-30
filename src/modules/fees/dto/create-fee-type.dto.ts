import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateFeeTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;

  @IsOptional()
  @IsString()
  accountCode?: string;
}

export class UpdateFeeTypeDto {
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
  @IsBoolean()
  isOptional?: boolean;

  @IsOptional()
  @IsString()
  accountCode?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
