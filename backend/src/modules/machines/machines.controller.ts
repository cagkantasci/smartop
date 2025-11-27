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
import { MachinesService } from './machines.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { QueryMachinesDto } from './dto/query-machines.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Machines')
@ApiBearerAuth('JWT-auth')
@Controller('machines')
export class MachinesController {
  constructor(private machinesService: MachinesService) {}

  @Post()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create a new machine' })
  @ApiResponse({ status: 201, description: 'Machine created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin or manager role' })
  async create(
    @Body() dto: CreateMachineDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.machinesService.create(dto, organizationId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all machines in organization' })
  @ApiResponse({ status: 200, description: 'List of machines' })
  async findAll(
    @Query() query: QueryMachinesDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.machinesService.findAll(organizationId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get machine by ID' })
  @ApiParam({ name: 'id', description: 'Machine ID' })
  @ApiResponse({ status: 200, description: 'Machine details' })
  @ApiResponse({ status: 404, description: 'Machine not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.machinesService.findOne(id, organizationId);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update machine' })
  @ApiParam({ name: 'id', description: 'Machine ID' })
  @ApiResponse({ status: 200, description: 'Machine updated' })
  @ApiResponse({ status: 404, description: 'Machine not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMachineDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.machinesService.update(id, dto, organizationId);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete machine' })
  @ApiParam({ name: 'id', description: 'Machine ID' })
  @ApiResponse({ status: 200, description: 'Machine deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin role' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.machinesService.remove(id, organizationId);
  }

  @Patch(':id/location')
  @ApiOperation({ summary: 'Update machine location' })
  @ApiParam({ name: 'id', description: 'Machine ID' })
  @ApiResponse({ status: 200, description: 'Location updated' })
  async updateLocation(
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.machinesService.updateLocation(id, dto, organizationId);
  }

  @Post(':id/assign')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Assign or unassign operator to machine' })
  @ApiParam({ name: 'id', description: 'Machine ID' })
  @ApiResponse({ status: 200, description: 'Operator assigned/unassigned' })
  async assignOperator(
    @Param('id') id: string,
    @Body('operatorId') operatorId: string | null,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.machinesService.assignOperator(id, operatorId, organizationId);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get machine usage history' })
  @ApiParam({ name: 'id', description: 'Machine ID' })
  @ApiResponse({ status: 200, description: 'Machine history' })
  async getHistory(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.machinesService.getHistory(id, organizationId);
  }

  @Get(':id/checklists')
  @ApiOperation({ summary: 'Get checklists submitted for machine' })
  @ApiParam({ name: 'id', description: 'Machine ID' })
  @ApiResponse({ status: 200, description: 'Machine checklists' })
  async getChecklists(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.machinesService.getChecklists(id, organizationId);
  }
}
