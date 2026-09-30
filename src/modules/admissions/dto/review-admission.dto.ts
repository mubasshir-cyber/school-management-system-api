import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewAdmissionDto {
  @ApiPropertyOptional({ example: 'Documents are verified and eligible' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectAdmissionDto {
  @ApiPropertyOptional({ example: 'Age criteria not met for selected standard' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class EnrollAdmissionDto {
  @ApiPropertyOptional({ example: 's0e00000-0000-0000-0000-000000000000' })
  @IsOptional()
  @IsString()
  sectionId?: string;

  @ApiPropertyOptional({ example: '25' })
  @IsOptional()
  @IsString()
  rollNumber?: string;
}
