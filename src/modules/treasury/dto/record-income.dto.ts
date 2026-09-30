import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';

export class RecordIncomeDto {
  @IsNotEmpty()
  @IsUUID()
  incomeCategoryId: string;

  @IsOptional()
  @IsUUID()
  treasuryAccountId?: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsDateString()
  transactionDate: string;

  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  payerName?: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
