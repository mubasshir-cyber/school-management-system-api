import { IsNotEmpty, IsUUID, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GuardianRelationshipType } from '../../../common/enums/status.enum';

export class LinkGuardianDto {
  @ApiProperty({ example: 'b0e00000-0000-0000-0000-000000000000' })
  @IsNotEmpty()
  @IsUUID()
  guardianId: string;

  @ApiProperty({ enum: GuardianRelationshipType, default: GuardianRelationshipType.FATHER })
  @IsNotEmpty()
  @IsEnum(GuardianRelationshipType)
  relationshipType: GuardianRelationshipType;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isEmergencyContact?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  canPickupStudent?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  receivesNotifications?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasPortalAccess?: boolean;
}
