import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../middleware/validate';
import {
  registerSchema,
  loginSchema,
  devLoginSchema,
  refreshTokenSchema,
} from '@mk-drycleaners/shared';

export const authRouter = Router();

authRouter.post(
  '/register',
  validate({ body: registerSchema }),
  authController.register.bind(authController)
);

authRouter.post(
  '/login',
  validate({ body: loginSchema }),
  authController.login.bind(authController)
);

authRouter.post(
  '/dev-login',
  validate({ body: devLoginSchema }),
  authController.devLogin.bind(authController)
);

authRouter.post(
  '/refresh',
  validate({ body: refreshTokenSchema }),
  authController.refresh.bind(authController)
);

authRouter.post('/logout', authController.logout.bind(authController));
