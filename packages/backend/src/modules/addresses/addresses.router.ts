import { Router } from 'express';
import { addressesController } from './addresses.controller';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { addressSchema, updateAddressSchema } from '@mk-drycleaners/shared';

export const addressesRouter = Router();

// Public route for checking serviceability
addressesRouter.get('/serviceability', addressesController.checkServiceability.bind(addressesController));

// Protected user address routes
addressesRouter.get('/', requireAuth, addressesController.getAddresses.bind(addressesController));

addressesRouter.post(
  '/',
  requireAuth,
  validate({ body: addressSchema }),
  addressesController.createAddress.bind(addressesController)
);

addressesRouter.put(
  '/:id',
  requireAuth,
  validate({ body: updateAddressSchema }),
  addressesController.updateAddress.bind(addressesController)
);

addressesRouter.delete('/:id', requireAuth, addressesController.deleteAddress.bind(addressesController));

addressesRouter.patch('/:id/default', requireAuth, addressesController.setDefaultAddress.bind(addressesController));
