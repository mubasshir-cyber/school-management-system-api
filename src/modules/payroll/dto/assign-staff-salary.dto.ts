import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';

export class AssignStaffSalaryDto {
  @IsNotEmpty()
  @IsUUID()
  staffId: string;

  @IsNotEmpty()
  @IsUUID()
  salaryStructureId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  baseGrossSalary: number;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  ifscCode?: string;

  @IsOptional()
  @IsString()
  panNumber?: string;

  @IsNotEmpty()
  @IsDateString()
  effectiveFrom: string;
}
