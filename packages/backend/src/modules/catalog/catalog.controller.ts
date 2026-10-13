import { Request, Response, NextFunction } from 'express';
import { catalogService } from './catalog.service';

export class CatalogController {
  // Categories
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const categories = await catalogService.getCategories(includeInactive);
      return res.status(200).json({ success: true, data: categories });
    } catch (error) {
      return next(error);
    }
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await catalogService.getCategoryById(req.params.id);
      return res.status(200).json({ success: true, data: category });
    } catch (error) {
      return next(error);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await catalogService.createCategory(req.body);
      return res.status(201).json({ success: true, data: created });
    } catch (error) {
      return next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await catalogService.updateCategory(req.params.id, req.body);
      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      return next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await catalogService.deleteCategory(req.params.id);
      return res.status(200).json({ success: true, message: 'Category deactivated successfully', data: deleted });
    } catch (error) {
      return next(error);
    }
  }

  // Items
  async getItems(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      const includeInactive = req.query.includeInactive === 'true';
      const items = await catalogService.getItems(categoryId, includeInactive);
      return res.status(200).json({ success: true, data: items });
    } catch (error) {
      return next(error);
    }
  }

  async getItemById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await catalogService.getItemById(req.params.id);
      return res.status(200).json({ success: true, data: item });
    } catch (error) {
      return next(error);
    }
  }

  async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await catalogService.createItem(req.body);
      return res.status(201).json({ success: true, data: created });
    } catch (error) {
      return next(error);
    }
  }

  async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await catalogService.updateItem(req.params.id, req.body);
      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      return next(error);
    }
  }

  async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await catalogService.deleteItem(req.params.id);
      return res.status(200).json({ success: true, message: 'Item deactivated successfully', data: deleted });
    } catch (error) {
      return next(error);
    }
  }

  // Services
  async getServices(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const services = await catalogService.getServices(includeInactive);
      return res.status(200).json({ success: true, data: services });
    } catch (error) {
      return next(error);
    }
  }

  async getServiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const service = await catalogService.getServiceById(req.params.id);
      return res.status(200).json({ success: true, data: service });
    } catch (error) {
      return next(error);
    }
  }

  async createService(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await catalogService.createService(req.body);
      return res.status(201).json({ success: true, data: created });
    } catch (error) {
      return next(error);
    }
  }

  async updateService(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await catalogService.updateService(req.params.id, req.body);
      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      return next(error);
    }
  }

  // Price Setting
  async setPrice(req: Request, res: Response, next: NextFunction) {
    try {
      const price = await catalogService.setPrice(req.body);
      return res.status(200).json({ success: true, data: price });
    } catch (error) {
      return next(error);
    }
  }

  // Booking Catalog
  async getBookingCatalog(req: Request, res: Response, next: NextFunction) {
    try {
      const catalog = await catalogService.getCatalogForBooking();
      return res.status(200).json({ success: true, data: catalog });
    } catch (error) {
      return next(error);
    }
  }
}

export const catalogController = new CatalogController();
