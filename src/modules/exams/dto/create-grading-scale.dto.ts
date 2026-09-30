import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GradingScaleType } from '../exams.enums';
import { GradeRange } from '../entities/grading-scale.entity';

export class CreateGradingScaleDto {
  @ApiProperty({ example: 'CBSE 10-Point Grading Scale' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: GradingScaleType, default: GradingScaleType.PERCENTAGE })
  @IsEnum(GradingScaleType)
  scaleType: GradingScaleType;

  @ApiPropertyOptional({ example: 'Standard scale for senior secondary classes' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiProperty({
    example: [
      { grade: 'A1', minScore: 91, maxScore: 100, gpaPoint: 10.0, remarks: 'Outstanding' },
      { grade: 'A2', minScore: 81, maxScore: 90, gpaPoint: 9.0, remarks: 'Excellent' },
      { grade: 'B1', minScore: 71, maxScore: 80, gpaPoint: 8.0, remarks: 'Very Good' },
      { grade: 'B2', minScore: 61, maxScore: 70, gpaPoint: 7.0, remarks: 'Good' },
      { grade: 'C1', minScore: 51, maxScore: 60, gpaPoint: 6.0, remarks: 'Fair' },
      { grade: 'C2', minScore: 41, maxScore: 50, gpaPoint: 5.0, remarks: 'Average' },
      { grade: 'D', minScore: 33, maxScore: 40, gpaPoint: 4.0, remarks: 'Pass' },
      { grade: 'E', minScore: 0, maxScore: 32, gpaPoint: 0.0, remarks: 'Needs Improvement / Fail' },
    ],
  })
  @IsArray()
  @IsNotEmpty()
  ranges: GradeRange[];
}
