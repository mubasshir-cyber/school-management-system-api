import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateFeeDiscountDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  discountType: 'PERCENTAGE' | 'FIXED';

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  value: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateFeeDiscountDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  discountType?: 'PERCENTAGE' | 'FIXED';

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
