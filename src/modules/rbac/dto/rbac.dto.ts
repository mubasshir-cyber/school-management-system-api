import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DataScope } from '../../../common/enums/scope.enum';
import { CommonStatus } from '../../../common/enums/status.enum';

export class CreatePermissionDto {
  @ApiProperty({ example: 'student.profile.create', description: 'Unique permission code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'student', description: 'Module name' })
  @IsString()
  @IsNotEmpty()
  module: string;

  @ApiProperty({ example: 'profile', description: 'Resource name' })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({ example: 'create', description: 'Action name' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ example: 'Create Student Profile', description: 'Human-readable permission name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Allows creating new student records' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateRoleDto {
  @ApiProperty({ example: 'Class Teacher', description: 'Role display name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'CLASS_TEACHER', description: 'Role code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: 'Manages class attendance, marks and reports' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: DataScope, default: DataScope.SECTION })
  @IsEnum(DataScope)
  @IsOptional()
  defaultScope?: DataScope;

  @ApiPropertyOptional({ type: [String], description: 'List of permission UUIDs to assign' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  permissionIds?: string[];
}

export class AssignPermissionsDto {
  @ApiProperty({ type: [String], description: 'List of permission UUIDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  permissionIds: string[];
}
