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
  ApiQuery,
} from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Jobs')
@ApiBearerAuth('JWT-auth')
@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Post()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create a new job/project' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin or manager role' })
  async create(
    @Body() dto: CreateJobDto,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.jobsService.create(dto, organizationId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs in organization' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'priority', required: false, description: 'Filter by priority' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'List of jobs' })
  async findAll(
    @Query('status') status: string,
    @Query('priority') priority: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.jobsService.findAll(organizationId, {
      status,
      priority,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job details' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.jobsService.findOne(id, organizationId);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job updated' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin or manager role' })
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateJobDto>,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.jobsService.update(id, dto, organizationId);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Delete job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job deleted' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin or manager role' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.jobsService.remove(id, organizationId);
  }

  @Patch(':id/start')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Start a job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job started' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin or manager role' })
  async startJob(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.jobsService.startJob(id, organizationId);
  }

  @Patch(':id/complete')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Complete a job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job completed' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin or manager role' })
  async completeJob(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.jobsService.completeJob(id, organizationId);
  }

  @Post(':id/assign')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Assign machines and operators to job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Resources assigned successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin or manager role' })
  async assignResources(
    @Param('id') id: string,
    @Body('machineIds') machineIds: string[],
    @Body('operatorIds') operatorIds: string[],
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.jobsService.assignResources(id, machineIds, operatorIds, organizationId);
  }
}
