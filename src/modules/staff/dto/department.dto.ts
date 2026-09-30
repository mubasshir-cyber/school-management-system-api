import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Mathematics Department' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'DEPT-MATH' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: 'Handles all mathematics and statistics curricula' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  @IsOptional()
  headOfDepartmentId?: string;
}

export class UpdateDepartmentDto {
  @ApiPropertyOptional({ example: 'Advanced Mathematics' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'DEPT-MATH' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  headOfDepartmentId?: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsString()
  @IsOptional()
  status?: string;
}
