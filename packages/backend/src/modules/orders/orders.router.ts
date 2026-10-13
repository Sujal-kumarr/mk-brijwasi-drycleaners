import { Router } from 'express';
import { ordersController } from './orders.controller';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createOrderSchema, approvePriceChangeSchema } from '@mk-drycleaners/shared';

export const ordersRouter = Router();

ordersRouter.use(requireAuth);

ordersRouter.post(
  '/',
  validate({ body: createOrderSchema }),
  ordersController.createOrder.bind(ordersController)
);

ordersRouter.get('/', ordersController.getCustomerOrders.bind(ordersController));

ordersRouter.get('/:id', ordersController.getOrderById.bind(ordersController));

ordersRouter.post('/:id/cancel', ordersController.cancelOrder.bind(ordersController));

ordersRouter.post(
  '/:id/approve-price',
  validate({ body: approvePriceChangeSchema }),
  ordersController.approvePriceChange.bind(ordersController)
);
