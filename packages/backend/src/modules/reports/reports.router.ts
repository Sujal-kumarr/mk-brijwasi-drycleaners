import { Router } from 'express';
import { reportsController } from './reports.controller';
import { requireAuth, requireRole } from '../../middleware/auth';

export const reportsRouter = Router();

reportsRouter.use(requireAuth);
reportsRouter.use(requireRole('SUPER_ADMIN', 'ADMIN'));

reportsRouter.get('/orders', reportsController.getOrderReports.bind(reportsController));
reportsRouter.get('/services', reportsController.getRevenueByService.bind(reportsController));
reportsRouter.get('/export/orders', reportsController.exportOrdersCsv.bind(reportsController));
