import { Router } from 'express';
import { partnersController } from './partners.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { partnerAssignmentUpdateSchema } from '@mk-drycleaners/shared';

export const partnersRouter = Router();

partnersRouter.use(requireAuth);
partnersRouter.use(requireRole('DELIVERY_PARTNER'));

partnersRouter.get('/profile', partnersController.getProfile.bind(partnersController));
partnersRouter.patch('/availability', partnersController.updateAvailability.bind(partnersController));

partnersRouter.get('/jobs', partnersController.getAssignedJobs.bind(partnersController));
partnersRouter.get('/jobs/:id', partnersController.getJobDetails.bind(partnersController));
partnersRouter.patch(
  '/jobs/:id/status',
  validate({ body: partnerAssignmentUpdateSchema }),
  partnersController.updateJobStatus.bind(partnersController)
);

partnersRouter.get('/earnings', partnersController.getEarnings.bind(partnersController));
partnersRouter.get('/earnings/summary', partnersController.getEarningsSummary.bind(partnersController));
