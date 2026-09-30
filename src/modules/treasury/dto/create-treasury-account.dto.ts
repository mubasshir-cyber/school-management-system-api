import { IsNotEmpty, IsString, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { TreasuryAccountType } from '../entities/treasury-account.entity';

export class CreateTreasuryAccountDto {
  @IsNotEmpty()
  @IsString()
  accountName: string;

  @IsNotEmpty()
  @IsEnum(TreasuryAccountType)
  accountType: TreasuryAccountType;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  branchName?: string;

  @IsOptional()
  @IsString()
  ifscCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  openingBalance?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateTreasuryAccountDto {
  @IsOptional()
  @IsString()
  accountName?: string;

  @IsOptional()
  @IsEnum(TreasuryAccountType)
  accountType?: TreasuryAccountType;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  branchName?: string;

  @IsOptional()
  @IsString()
  ifscCode?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
