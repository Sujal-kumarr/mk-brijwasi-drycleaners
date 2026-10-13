import { Router } from 'express';
import { adminController } from './admin.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  updateOrderStatusSchema,
  updateOrderInspectionSchema,
  businessConfigSchema,
  serviceAreaSchema,
  timeSlotSchema,
} from '@mk-drycleaners/shared';

export const adminRouter = Router();

// Staff & Admin access
adminRouter.use(requireAuth);
adminRouter.use(requireRole('SUPER_ADMIN', 'ADMIN', 'LAUNDRY_STAFF'));

// Dashboard metrics
adminRouter.get('/dashboard', adminController.getDashboardMetrics.bind(adminController));

// Order Management
adminRouter.get('/orders', adminController.getOrders.bind(adminController));

adminRouter.patch(
  '/orders/:id/status',
  validate({ body: updateOrderStatusSchema }),
  adminController.updateOrderStatus.bind(adminController)
);

adminRouter.post(
  '/orders/:id/inspect',
  validate({ body: updateOrderInspectionSchema }),
  adminController.inspectOrder.bind(adminController)
);

adminRouter.post('/orders/:id/assign', adminController.assignPartner.bind(adminController));

// Customer Directory
adminRouter.get('/customers', adminController.getCustomers.bind(adminController));
adminRouter.get('/customers/:id', adminController.getCustomerById.bind(adminController));

// Staff & Fleet Management (Admins only)
adminRouter.get('/staff', requireRole('SUPER_ADMIN', 'ADMIN'), adminController.getStaffAndPartners.bind(adminController));
adminRouter.post('/partners', requireRole('SUPER_ADMIN', 'ADMIN'), adminController.createPartner.bind(adminController));
adminRouter.patch('/partners/:id/toggle', requireRole('SUPER_ADMIN', 'ADMIN'), adminController.togglePartnerStatus.bind(adminController));

// Business Configuration
adminRouter.get('/config', adminController.getBusinessConfig.bind(adminController));
adminRouter.put(
  '/config',
  requireRole('SUPER_ADMIN', 'ADMIN'),
  validate({ body: businessConfigSchema }),
  adminController.updateBusinessConfig.bind(adminController)
);

// Service Areas
adminRouter.get('/service-areas', adminController.getServiceAreas.bind(adminController));
adminRouter.post(
  '/service-areas',
  requireRole('SUPER_ADMIN', 'ADMIN'),
  validate({ body: serviceAreaSchema }),
  adminController.createServiceArea.bind(adminController)
);
adminRouter.put(
  '/service-areas/:id',
  requireRole('SUPER_ADMIN', 'ADMIN'),
  validate({ body: serviceAreaSchema.partial() }),
  adminController.updateServiceArea.bind(adminController)
);
adminRouter.delete('/service-areas/:id', requireRole('SUPER_ADMIN', 'ADMIN'), adminController.deleteServiceArea.bind(adminController));

// Time Slots
adminRouter.get('/time-slots', adminController.getTimeSlots.bind(adminController));
adminRouter.post(
  '/time-slots',
  requireRole('SUPER_ADMIN', 'ADMIN'),
  validate({ body: timeSlotSchema }),
  adminController.createTimeSlot.bind(adminController)
);
adminRouter.put(
  '/time-slots/:id',
  requireRole('SUPER_ADMIN', 'ADMIN'),
  validate({ body: timeSlotSchema.partial() }),
  adminController.updateTimeSlot.bind(adminController)
);
