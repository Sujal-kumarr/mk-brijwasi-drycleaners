import { Router } from 'express';
import { paymentsController } from './payments.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { recordPaymentSchema, refundPaymentSchema } from '@mk-drycleaners/shared';

export const paymentsRouter = Router();

paymentsRouter.use(requireAuth);
paymentsRouter.use(requireRole('SUPER_ADMIN', 'ADMIN'));

paymentsRouter.get('/', paymentsController.getPayments.bind(paymentsController));
paymentsRouter.post(
  '/',
  validate({ body: recordPaymentSchema }),
  paymentsController.recordPayment.bind(paymentsController)
);

paymentsRouter.post(
  '/refund',
  validate({ body: refundPaymentSchema }),
  paymentsController.refundPayment.bind(paymentsController)
);

paymentsRouter.get('/summary', paymentsController.getFinancialSummary.bind(paymentsController));

paymentsRouter.get('/expenses', paymentsController.getExpenses.bind(paymentsController));
paymentsRouter.post('/expenses', paymentsController.recordExpense.bind(paymentsController));

paymentsRouter.post('/payouts', paymentsController.recordPartnerPayout.bind(paymentsController));
