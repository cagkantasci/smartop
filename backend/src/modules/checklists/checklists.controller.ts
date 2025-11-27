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
import { ChecklistsService } from './checklists.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ReviewSubmissionDto } from './dto/review-submission.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Checklists')
@ApiBearerAuth('JWT-auth')
@Controller('checklists')
export class ChecklistsController {
  constructor(private checklistsService: ChecklistsService) {}

  // Template endpoints
  @Post('templates')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create a new checklist template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin or manager role' })
  async createTemplate(
    @Body() dto: CreateTemplateDto,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.checklistsService.createTemplate(dto, organizationId, userId);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all checklist templates' })
  @ApiResponse({ status: 200, description: 'List of templates' })
  async findAllTemplates(
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.checklistsService.findAllTemplates(organizationId);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get checklist template by ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template details' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findOneTemplate(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.checklistsService.findOneTemplate(id, organizationId);
  }

  @Patch('templates/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update checklist template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template updated' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin or manager role' })
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: Partial<CreateTemplateDto>,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.checklistsService.updateTemplate(id, dto, organizationId);
  }

  @Delete('templates/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Delete checklist template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template deleted' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin or manager role' })
  async deleteTemplate(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.checklistsService.deleteTemplate(id, organizationId);
  }

  // Submission endpoints
  @Post('submissions')
  @ApiOperation({ summary: 'Submit a checklist' })
  @ApiResponse({ status: 201, description: 'Checklist submitted successfully' })
  async createSubmission(
    @Body() dto: CreateSubmissionDto,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.checklistsService.createSubmission(dto, organizationId, userId);
  }

  @Get('submissions')
  @ApiOperation({ summary: 'Get all checklist submissions' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status (pending, approved, rejected)' })
  @ApiQuery({ name: 'machineId', required: false, description: 'Filter by machine ID' })
  @ApiQuery({ name: 'operatorId', required: false, description: 'Filter by operator ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'List of submissions' })
  async findAllSubmissions(
    @Query('status') status: string,
    @Query('machineId') machineId: string,
    @Query('operatorId') operatorId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.checklistsService.findAllSubmissions(organizationId, {
      status,
      machineId,
      operatorId,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
  }

  @Get('submissions/:id')
  @ApiOperation({ summary: 'Get checklist submission by ID' })
  @ApiParam({ name: 'id', description: 'Submission ID' })
  @ApiResponse({ status: 200, description: 'Submission details' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  async findOneSubmission(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.checklistsService.findOneSubmission(id, organizationId);
  }

  @Patch('submissions/:id/review')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Review (approve/reject) a checklist submission' })
  @ApiParam({ name: 'id', description: 'Submission ID' })
  @ApiResponse({ status: 200, description: 'Submission reviewed' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin or manager role' })
  async reviewSubmission(
    @Param('id') id: string,
    @Body() dto: ReviewSubmissionDto,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.checklistsService.reviewSubmission(id, dto, organizationId, userId, role);
  }
}
