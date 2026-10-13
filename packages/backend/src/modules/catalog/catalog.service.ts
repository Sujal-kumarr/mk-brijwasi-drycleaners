import { prisma } from '../../utils/prisma';
import {
  ClothingCategoryInput,
  ClothingItemInput,
  LaundryServiceInput,
  ServicePriceInput,
} from '@mk-drycleaners/shared';

export class CatalogService {
  // Categories
  async getCategories(includeInactive = false) {
    return prisma.clothingCategory.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getCategoryById(id: string) {
    const category = await prisma.clothingCategory.findUnique({
      where: { id },
      include: {
        items: {
          where: { isActive: true },
          include: {
            prices: {
              where: { isActive: true },
              include: { laundryService: true },
            },
          },
        },
      },
    });
    if (!category) {
      throw Object.assign(new Error('Category not found'), { statusCode: 404 });
    }
    return category;
  }

  async createCategory(data: ClothingCategoryInput) {
    return prisma.clothingCategory.create({
      data,
    });
  }

  async updateCategory(id: string, data: Partial<ClothingCategoryInput>) {
    return prisma.clothingCategory.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    return prisma.clothingCategory.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Items
  async getItems(categoryId?: string, includeInactive = false) {
    return prisma.clothingItem.findMany({
      where: {
        ...(includeInactive ? {} : { isActive: true }),
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        category: true,
        prices: {
          where: { isActive: true },
          include: { laundryService: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getItemById(id: string) {
    const item = await prisma.clothingItem.findUnique({
      where: { id },
      include: {
        category: true,
        prices: {
          include: { laundryService: true },
        },
      },
    });
    if (!item) {
      throw Object.assign(new Error('Clothing item not found'), { statusCode: 404 });
    }
    return item;
  }

  async createItem(data: ClothingItemInput) {
    return prisma.clothingItem.create({
      data,
      include: {
        category: true,
      },
    });
  }

  async updateItem(id: string, data: Partial<ClothingItemInput>) {
    return prisma.clothingItem.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async deleteItem(id: string) {
    return prisma.clothingItem.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Services
  async getServices(includeInactive = false) {
    return prisma.laundryService.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getServiceById(id: string) {
    const service = await prisma.laundryService.findUnique({
      where: { id },
    });
    if (!service) {
      throw Object.assign(new Error('Laundry service not found'), { statusCode: 404 });
    }
    return service;
  }

  async createService(data: LaundryServiceInput) {
    return prisma.laundryService.create({
      data,
    });
  }

  async updateService(id: string, data: Partial<LaundryServiceInput>) {
    return prisma.laundryService.update({
      where: { id },
      data,
    });
  }

  // Pricing Matrix
  async setPrice(data: ServicePriceInput) {
    return prisma.servicePrice.upsert({
      where: {
        clothingItemId_laundryServiceId: {
          clothingItemId: data.clothingItemId,
          laundryServiceId: data.laundryServiceId,
        },
      },
      update: {
        priceInPaise: data.priceInPaise,
        minQty: data.minQty,
        estimatedDays: data.estimatedDays ?? 2,
        isActive: data.isActive ?? true,
      },
      create: {
        clothingItemId: data.clothingItemId,
        laundryServiceId: data.laundryServiceId,
        priceInPaise: data.priceInPaise,
        minQty: data.minQty,
        estimatedDays: data.estimatedDays ?? 2,
        isActive: data.isActive ?? true,
      },
      include: {
        clothingItem: true,
        laundryService: true,
      },
    });
  }

  // Booking Catalog
  async getCatalogForBooking() {
    return prisma.clothingCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        items: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
          include: {
            prices: {
              where: { isActive: true },
              include: {
                laundryService: true,
              },
            },
          },
        },
      },
    });
  }

  async getTimeSlots() {
    return prisma.timeSlot.findMany({
      where: { isActive: true },
      orderBy: [{ slotType: 'asc' }, { startHour: 'asc' }],
    });
  }
}

export const catalogService = new CatalogService();
