import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class MachineReferenceService {
  constructor(private prisma: PrismaService) {}

  // Get all categories with optional parent filter
  async getCategories(parentId?: string) {
    const where = parentId === undefined
      ? {}
      : parentId === null
        ? { parentId: null }
        : { parentId };

    return this.prisma.machineCategory.findMany({
      where: {
        ...where,
        isActive: true,
      },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // Get all brands with optional popular filter
  async getBrands(popularOnly?: boolean) {
    return this.prisma.machineBrand.findMany({
      where: {
        isActive: true,
        ...(popularOnly && { isPopular: true }),
      },
      orderBy: [
        { isPopular: 'desc' },
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  // Search brands by name
  async searchBrands(query: string, limit: number = 20) {
    return this.prisma.machineBrand.findMany({
      where: {
        isActive: true,
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: [
        { isPopular: 'desc' },
        { name: 'asc' },
      ],
      take: limit,
    });
  }

  // Get models by brand and optional category
  async getModels(brandId?: string, categoryId?: string, search?: string) {
    return this.prisma.machineModel.findMany({
      where: {
        isActive: true,
        ...(brandId && { brandId }),
        ...(categoryId && { categoryId }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        brand: {
          select: { id: true, name: true, slug: true },
        },
        category: {
          select: { id: true, name: true, nameEn: true, nameTr: true, slug: true },
        },
      },
      orderBy: { name: 'asc' },
      take: 100,
    });
  }

  // Search models by name
  async searchModels(query: string, brandId?: string, categoryId?: string, limit: number = 30) {
    return this.prisma.machineModel.findMany({
      where: {
        isActive: true,
        ...(brandId && { brandId }),
        ...(categoryId && { categoryId }),
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { fullName: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        brand: {
          select: { id: true, name: true, slug: true },
        },
        category: {
          select: { id: true, name: true, nameEn: true, nameTr: true, slug: true },
        },
      },
      orderBy: { name: 'asc' },
      take: limit,
    });
  }

  // Smart fill - get suggestions based on machine name input
  async smartFill(machineName: string) {
    const query = machineName.trim().toUpperCase();
    const words = query.split(/\s+/).filter(w => w.length > 1);

    if (words.length === 0) {
      return {
        suggestions: [],
        matchedBrand: null,
        matchedCategory: null,
        matchedModels: [],
      };
    }

    // Try to match brand (first word or first two words)
    let matchedBrand = await this.prisma.machineBrand.findFirst({
      where: {
        isActive: true,
        OR: [
          { name: { equals: words[0], mode: 'insensitive' } },
          { name: { equals: words.slice(0, 2).join(' '), mode: 'insensitive' } },
          { name: { contains: words[0], mode: 'insensitive' } },
        ],
      },
      orderBy: { isPopular: 'desc' },
    });

    // Try to match category from any word
    let matchedCategory = null;
    for (const word of words) {
      matchedCategory = await this.prisma.machineCategory.findFirst({
        where: {
          isActive: true,
          OR: [
            { name: { contains: word, mode: 'insensitive' } },
            { nameEn: { contains: word, mode: 'insensitive' } },
            { nameTr: { contains: word, mode: 'insensitive' } },
            { slug: { contains: word.toLowerCase(), mode: 'insensitive' } },
          ],
        },
      });
      if (matchedCategory) break;
    }

    // Try to match model
    const modelSearchQuery = words.slice(matchedBrand ? 1 : 0).join(' ');
    const matchedModels = await this.findMatchedModels(matchedBrand?.id, modelSearchQuery, query);

    // Build suggestions array combining all possibilities
    const suggestions: Array<{
      type: string;
      brand: string;
      brandId: string;
      model: string | null;
      modelId: string | null;
      fullName: string;
      category: string | null;
      categoryId: string | null;
      confidence: number;
    }> = [];

    // If we found models, add them as suggestions
    for (const model of matchedModels) {
      suggestions.push({
        type: 'model',
        brand: model.brand.name,
        brandId: model.brand.id,
        model: model.name,
        modelId: model.id,
        fullName: model.fullName || `${model.brand.name} ${model.name}`,
        category: model.category?.name || null,
        categoryId: model.category?.id || null,
        confidence: this.calculateConfidence(query, model),
      });
    }

    // If we found a brand but no models matched, suggest the brand with common categories
    if (matchedBrand && matchedModels.length === 0) {
      // Get the most common categories for this brand
      const brandCategories = await this.prisma.machineModel.groupBy({
        by: ['categoryId'],
        where: {
          brandId: matchedBrand.id,
          categoryId: { not: null },
        },
        _count: true,
        orderBy: { _count: { categoryId: 'desc' } },
        take: 5,
      });

      for (const cat of brandCategories) {
        if (cat.categoryId) {
          const category = await this.prisma.machineCategory.findUnique({
            where: { id: cat.categoryId },
          });
          if (category) {
            suggestions.push({
              type: 'brand_category',
              brand: matchedBrand.name,
              brandId: matchedBrand.id,
              model: null,
              modelId: null,
              fullName: `${matchedBrand.name} (${category.nameTr || category.name})`,
              category: category.name,
              categoryId: category.id,
              confidence: 0.6,
            });
          }
        }
      }
    }

    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);

    // If we have a category match but no models yet, search by category
    if (matchedCategory && matchedModels.length === 0 && matchedBrand) {
      // First try exact category match
      let categoryModels = await this.prisma.machineModel.findMany({
        where: {
          isActive: true,
          brandId: matchedBrand.id,
          categoryId: matchedCategory.id,
        },
        include: {
          brand: {
            select: { id: true, name: true, slug: true },
          },
          category: {
            select: { id: true, name: true, nameEn: true, nameTr: true, slug: true },
          },
        },
        orderBy: { name: 'asc' },
        take: 30,
      });

      // If no models in that exact category, get all models for this brand
      if (categoryModels.length === 0) {
        categoryModels = await this.prisma.machineModel.findMany({
          where: {
            isActive: true,
            brandId: matchedBrand.id,
          },
          include: {
            brand: {
              select: { id: true, name: true, slug: true },
            },
            category: {
              select: { id: true, name: true, nameEn: true, nameTr: true, slug: true },
            },
          },
          orderBy: { name: 'asc' },
          take: 30,
        });
      }

      for (const model of categoryModels) {
        suggestions.push({
          type: 'model',
          brand: model.brand.name,
          brandId: model.brand.id,
          model: model.name,
          modelId: model.id,
          fullName: model.fullName || `${model.brand.name} ${model.name}`,
          category: model.category?.name || null,
          categoryId: model.category?.id || null,
          confidence: this.calculateConfidence(query, model),
        });
      }
    }

    // Re-sort by confidence after adding category models
    suggestions.sort((a, b) => b.confidence - a.confidence);

    return {
      suggestions: suggestions.slice(0, 30),
      matchedBrand: matchedBrand ? {
        id: matchedBrand.id,
        name: matchedBrand.name,
        slug: matchedBrand.slug,
      } : null,
      matchedCategory: matchedCategory ? {
        id: matchedCategory.id,
        name: matchedCategory.name,
        nameEn: matchedCategory.nameEn,
        nameTr: matchedCategory.nameTr,
        slug: matchedCategory.slug,
      } : null,
      matchedModels: matchedModels.slice(0, 30),
    };
  }

  private async findMatchedModels(brandId: string | undefined, modelSearchQuery: string, fullQuery: string) {
    if (!modelSearchQuery && !brandId) {
      return [];
    }

    return this.prisma.machineModel.findMany({
      where: {
        isActive: true,
        ...(brandId && { brandId }),
        ...(modelSearchQuery && {
          OR: [
            { name: { contains: modelSearchQuery, mode: 'insensitive' } },
            { fullName: { contains: fullQuery, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        brand: {
          select: { id: true, name: true, slug: true },
        },
        category: {
          select: { id: true, name: true, nameEn: true, nameTr: true, slug: true },
        },
      },
      orderBy: { name: 'asc' },
      take: 30,
    });
  }

  private calculateConfidence(query: string, model: any): number {
    const fullName = (model.fullName || `${model.brand.name} ${model.name}`).toUpperCase();
    const queryUpper = query.toUpperCase();

    // Exact match
    if (fullName === queryUpper) return 1.0;

    // Full name starts with query
    if (fullName.startsWith(queryUpper)) return 0.95;

    // Full name contains query
    if (fullName.includes(queryUpper)) return 0.85;

    // Model name matches
    if (model.name.toUpperCase() === queryUpper.split(' ').slice(-1)[0]) return 0.8;

    // Partial match
    const queryWords = queryUpper.split(/\s+/);
    const matchedWords = queryWords.filter(w => fullName.includes(w));
    return 0.5 + (0.4 * matchedWords.length / queryWords.length);
  }

  // Get category suggestions based on machine type keywords
  async suggestCategory(keyword: string) {
    return this.prisma.machineCategory.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { nameEn: { contains: keyword, mode: 'insensitive' } },
          { nameTr: { contains: keyword, mode: 'insensitive' } },
          { slug: { contains: keyword.toLowerCase(), mode: 'insensitive' } },
        ],
      },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
      take: 10,
    });
  }

  // Get statistics about reference data
  async getStats() {
    const [categories, brands, models, popularBrands] = await Promise.all([
      this.prisma.machineCategory.count({ where: { isActive: true } }),
      this.prisma.machineBrand.count({ where: { isActive: true } }),
      this.prisma.machineModel.count({ where: { isActive: true } }),
      this.prisma.machineBrand.count({ where: { isActive: true, isPopular: true } }),
    ]);

    return {
      categories,
      brands,
      models,
      popularBrands,
    };
  }
}
