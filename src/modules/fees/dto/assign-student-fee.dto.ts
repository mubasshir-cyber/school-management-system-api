import { IsNotEmpty, IsUUID, IsOptional, IsNumber } from 'class-validator';

export class AssignStudentFeeDto {
  @IsNotEmpty()
  @IsUUID()
  academicYearId: string;

  @IsNotEmpty()
  @IsUUID()
  studentId: string;

  @IsNotEmpty()
  @IsUUID()
  feeStructureId: string;

  @IsOptional()
  @IsUUID()
  feeDiscountId?: string;

  @IsOptional()
  @IsNumber()
  customDiscountAmount?: number;
}
