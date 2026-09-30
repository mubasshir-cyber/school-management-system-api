import { IsString, IsNotEmpty, IsOptional, IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDesignationDto {
  @ApiProperty({ example: 'Senior Lecturer' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'DESIG-SR-LEC' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ example: 'Teaches senior secondary students' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsInt()
  @Min(1)
  @IsOptional()
  level?: number;
}

export class UpdateDesignationDto {
  @ApiPropertyOptional({ example: 'Lead Lecturer' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'DESIG-LEAD-LEC' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  level?: number;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsString()
  @IsOptional()
  status?: string;
}
