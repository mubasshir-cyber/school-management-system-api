import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsUUID,
  Min,
  Max,
} from 'class-validator';

export class GeneratePayrollDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(2020)
  @Max(2100)
  year: number;

  @IsNotEmpty()
  @IsString()
  payrollTitle: string;

  @IsOptional()
  @IsUUID()
  academicYearId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class DisbursePayrollDto {
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  transactionReferencePrefix?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
