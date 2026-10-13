import { Router } from 'express';
import { catalogController } from './catalog.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  clothingCategorySchema,
  clothingItemSchema,
  laundryServiceSchema,
  servicePriceSchema,
} from '@mk-drycleaners/shared';

export const catalogRouter = Router();

// Public Endpoints
catalogRouter.get('/categories', catalogController.getCategories.bind(catalogController));
catalogRouter.get('/categories/:id', catalogController.getCategoryById.bind(catalogController));
catalogRouter.get('/items', catalogController.getItems.bind(catalogController));
catalogRouter.get('/items/:id', catalogController.getItemById.bind(catalogController));
catalogRouter.get('/services', catalogController.getServices.bind(catalogController));
catalogRouter.get('/services/:id', catalogController.getServiceById.bind(catalogController));
catalogRouter.get('/booking', catalogController.getBookingCatalog.bind(catalogController));

// Admin Protected Endpoints
const adminAuth = [requireAuth, requireRole('SUPER_ADMIN', 'ADMIN')];

catalogRouter.post(
  '/categories',
  ...adminAuth,
  validate({ body: clothingCategorySchema }),
  catalogController.createCategory.bind(catalogController)
);

catalogRouter.put(
  '/categories/:id',
  ...adminAuth,
  validate({ body: clothingCategorySchema.partial() }),
  catalogController.updateCategory.bind(catalogController)
);

catalogRouter.delete(
  '/categories/:id',
  ...adminAuth,
  catalogController.deleteCategory.bind(catalogController)
);

catalogRouter.post(
  '/items',
  ...adminAuth,
  validate({ body: clothingItemSchema }),
  catalogController.createItem.bind(catalogController)
);

catalogRouter.put(
  '/items/:id',
  ...adminAuth,
  validate({ body: clothingItemSchema.partial() }),
  catalogController.updateItem.bind(catalogController)
);

catalogRouter.delete(
  '/items/:id',
  ...adminAuth,
  catalogController.deleteItem.bind(catalogController)
);

catalogRouter.post(
  '/services',
  ...adminAuth,
  validate({ body: laundryServiceSchema }),
  catalogController.createService.bind(catalogController)
);

catalogRouter.put(
  '/services/:id',
  ...adminAuth,
  validate({ body: laundryServiceSchema.partial() }),
  catalogController.updateService.bind(catalogController)
);

catalogRouter.post(
  '/prices',
  ...adminAuth,
  validate({ body: servicePriceSchema }),
  catalogController.setPrice.bind(catalogController)
);
