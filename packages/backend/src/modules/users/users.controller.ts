import { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';

export class UsersController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await usersService.getProfile(req.user!.id);
      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      return next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await usersService.updateProfile(req.user!.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updated,
      });
    } catch (error) {
      return next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await usersService.changePassword(req.user!.id, req.body);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const usersController = new UsersController();
