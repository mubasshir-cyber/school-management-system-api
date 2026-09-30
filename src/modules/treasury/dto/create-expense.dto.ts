import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateExpenseDto {
  @IsNotEmpty()
  @IsUUID()
  expenseCategoryId: string;

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
  expenseDate: string;

  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  payeeName?: string;

  @IsOptional()
  @IsString()
  vendorName?: string;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ReviewExpenseDto {
  @IsNotEmpty()
  @IsString()
  status: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
