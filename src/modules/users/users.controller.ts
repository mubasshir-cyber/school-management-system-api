import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/users.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions('user.account.create')
  @ApiOperation({ summary: 'Create user with credentials and role assignment' })
  createUser(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('schoolId') schoolId: string,
    @Body() dto: CreateUserDto,
  ) {
    return this.usersService.createUser(tenantId, schoolId, dto);
  }

  @Get()
  @RequirePermissions('user.account.read')
  @ApiOperation({ summary: 'Get paginated list of users for active school' })
  getAllUsers(
    @CurrentUser('schoolId') schoolId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.getAllUsers(schoolId, page, limit);
  }

  @Get(':id')
  @RequirePermissions('user.account.read')
  @ApiOperation({ summary: 'Get user details by ID' })
  getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }
}
