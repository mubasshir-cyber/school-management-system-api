import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExamTypeDto {
  @ApiProperty({ example: 'Mid-Term Examination' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'MIDTERM' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: 'First semester comprehensive evaluation' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 30.0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weightage?: number;
}
