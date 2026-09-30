import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';
import { FeePaymentMethod } from '../entities/fee-payment.entity';

export class CollectFeePaymentDto {
  @IsNotEmpty()
  @IsUUID()
  studentId: string;

  @IsOptional()
  @IsUUID()
  feeInvoiceId?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsNotEmpty()
  @IsDateString()
  paymentDate: string;

  @IsNotEmpty()
  @IsEnum(FeePaymentMethod)
  paymentMethod: FeePaymentMethod;

  @IsOptional()
  @IsString()
  transactionReference?: string;

  @IsOptional()
  @IsString()
  chequeNumber?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
