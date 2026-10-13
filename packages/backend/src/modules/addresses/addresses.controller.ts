import { Request, Response, NextFunction } from 'express';
import { addressesService } from './addresses.service';

export class AddressesController {
  async getAddresses(req: Request, res: Response, next: NextFunction) {
    try {
      const addresses = await addressesService.getAddresses(req.user!.id);
      return res.status(200).json({ success: true, data: addresses });
    } catch (error) {
      return next(error);
    }
  }

  async createAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const address = await addressesService.createAddress(req.user!.id, req.body);
      return res.status(201).json({ success: true, data: address });
    } catch (error) {
      return next(error);
    }
  }

  async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const address = await addressesService.updateAddress(req.user!.id, req.params.id, req.body);
      return res.status(200).json({ success: true, data: address });
    } catch (error) {
      return next(error);
    }
  }

  async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await addressesService.deleteAddress(req.user!.id, req.params.id);
      return res.status(200).json({ success: true, message: 'Address removed successfully', data: deleted });
    } catch (error) {
      return next(error);
    }
  }

  async setDefaultAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const address = await addressesService.setDefaultAddress(req.user!.id, req.params.id);
      return res.status(200).json({ success: true, message: 'Default address updated', data: address });
    } catch (error) {
      return next(error);
    }
  }

  async checkServiceability(req: Request, res: Response, next: NextFunction) {
    try {
      const pincode = req.query.pincode as string;
      if (!pincode) {
        return res.status(400).json({ success: false, error: 'Pincode query param is required' });
      }
      const result = await addressesService.checkServiceability(pincode);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }
}

export const addressesController = new AddressesController();
