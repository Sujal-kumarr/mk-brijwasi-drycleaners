import { Router } from 'express';
import { usersController } from './users.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { updateProfileSchema, changePasswordSchema } from '@mk-drycleaners/shared';

export const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.get('/profile', usersController.getProfile.bind(usersController));

usersRouter.patch(
  '/profile',
  validate({ body: updateProfileSchema }),
  usersController.updateProfile.bind(usersController)
);

usersRouter.post(
  '/change-password',
  validate({ body: changePasswordSchema }),
  usersController.changePassword.bind(usersController)
);
