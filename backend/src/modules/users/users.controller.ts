import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new user in organization' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin role' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.usersService.create(dto, organizationId, role);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users in organization' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async findAll(
    @Query() query: QueryUsersDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.usersService.findAll(organizationId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.usersService.findOne(id, organizationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.usersService.update(id, dto, organizationId, userId, role);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin role' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.usersService.remove(id, organizationId, role);
  }

  @Post('location')
  @ApiOperation({ summary: 'Update current user location (for live tracking)' })
  @ApiResponse({ status: 200, description: 'Location updated' })
  async updateLocation(
    @Body() dto: UpdateLocationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.updateLocation(userId, dto);
  }

  @Get('operators/locations')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get all operators with their current locations' })
  @ApiResponse({ status: 200, description: 'List of operators with locations' })
  async getOperatorsWithLocation(
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.usersService.getOperatorsWithLocation(organizationId);
  }

  @Post('biometric')
  @ApiOperation({ summary: 'Toggle biometric authentication' })
  @ApiResponse({ status: 200, description: 'Biometric setting updated' })
  async toggleBiometric(
    @Body('enabled') enabled: boolean,
    @CurrentUser('id') userId: string,
  ) {
    return this.usersService.toggleBiometric(userId, enabled);
  }
}
