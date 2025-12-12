import { Controller, Get, Query } from '@nestjs/common';
import { MachineReferenceService } from './machine-reference.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('machine-reference')
export class MachineReferenceController {
  constructor(private readonly machineReferenceService: MachineReferenceService) {}

  // Public endpoints - no auth required for reference data

  @Public()
  @Get('categories')
  async getCategories(@Query('parentId') parentId?: string) {
    // Convert 'null' string to undefined (for root categories)
    // or pass the parentId as is
    if (parentId === 'null' || parentId === 'root') {
      return this.machineReferenceService.getCategories(undefined);
    }
    return this.machineReferenceService.getCategories(parentId);
  }

  @Public()
  @Get('brands')
  async getBrands(@Query('popularOnly') popularOnly?: string) {
    return this.machineReferenceService.getBrands(popularOnly === 'true');
  }

  @Public()
  @Get('brands/search')
  async searchBrands(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    return this.machineReferenceService.searchBrands(query || '', parseInt(limit || '20'));
  }

  @Public()
  @Get('models')
  async getModels(
    @Query('brandId') brandId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.machineReferenceService.getModels(brandId, categoryId, search);
  }

  @Public()
  @Get('models/search')
  async searchModels(
    @Query('q') query: string,
    @Query('brandId') brandId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.machineReferenceService.searchModels(
      query || '',
      brandId,
      categoryId,
      parseInt(limit || '30'),
    );
  }

  @Public()
  @Get('smart-fill')
  async smartFill(@Query('name') name: string) {
    if (!name || name.trim().length < 2) {
      return {
        suggestions: [],
        matchedBrand: null,
        matchedCategory: null,
        matchedModels: [],
      };
    }
    return this.machineReferenceService.smartFill(name);
  }

  @Public()
  @Get('categories/suggest')
  async suggestCategory(@Query('keyword') keyword: string) {
    return this.machineReferenceService.suggestCategory(keyword || '');
  }

  @Public()
  @Get('stats')
  async getStats() {
    return this.machineReferenceService.getStats();
  }
}
