import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @IsNotEmpty()
  @IsUUID()
  feeTypeId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;
}

export class GenerateInvoiceDto {
  @IsNotEmpty()
  @IsUUID()
  studentId: string;

  @IsNotEmpty()
  @IsUUID()
  academicYearId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsDateString()
  invoiceDate: string;

  @IsNotEmpty()
  @IsDateString()
  dueDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkGenerateInvoicesDto {
  @IsNotEmpty()
  @IsUUID()
  academicYearId: string;

  @IsNotEmpty()
  @IsUUID()
  classId: string;

  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @IsNotEmpty()
  @IsUUID()
  feeStructureId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsDateString()
  invoiceDate: string;

  @IsNotEmpty()
  @IsDateString()
  dueDate: string;
}
