import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Organizations')
@ApiBearerAuth('JWT-auth')
@Controller('organizations')
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get organization details' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Organization details' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.organizationsService.findOne(id, userId);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update organization settings' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Organization updated' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin role' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.organizationsService.update(id, dto, userId);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get organization statistics' })
  @ApiParam({ name: 'id', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Organization statistics' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getStats(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.organizationsService.getStats(id, userId);
  }
}
