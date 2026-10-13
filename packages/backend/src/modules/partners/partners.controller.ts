import { Request, Response, NextFunction } from 'express';
import { partnersService } from './partners.service';
import { AssignmentStatus } from '@prisma/client';

export class PartnersController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await partnersService.getPartnerProfile(req.user!.id);
      return res.status(200).json({ success: true, data: profile });
    } catch (error) {
      return next(error);
    }
  }

  async updateAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { isAvailable } = req.body;
      const profile = await partnersService.updateAvailability(req.user!.id, isAvailable);
      return res.status(200).json({ success: true, message: 'Availability updated', data: profile });
    } catch (error) {
      return next(error);
    }
  }

  async getAssignedJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as AssignmentStatus | undefined;
      const jobs = await partnersService.getAssignedJobs(req.user!.id, status);
      return res.status(200).json({ success: true, data: jobs });
    } catch (error) {
      return next(error);
    }
  }

  async getJobDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await partnersService.getJobDetails(req.user!.id, req.params.id);
      return res.status(200).json({ success: true, data: job });
    } catch (error) {
      return next(error);
    }
  }

  async updateJobStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await partnersService.updateJobStatus(req.user!.id, req.params.id, req.body);
      return res.status(200).json({ success: true, message: 'Job status updated', data: updated });
    } catch (error) {
      return next(error);
    }
  }

  async getEarnings(req: Request, res: Response, next: NextFunction) {
    try {
      const earnings = await partnersService.getEarnings(req.user!.id);
      return res.status(200).json({ success: true, data: earnings });
    } catch (error) {
      return next(error);
    }
  }

  async getEarningsSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await partnersService.getEarningsSummary(req.user!.id);
      return res.status(200).json({ success: true, data: summary });
    } catch (error) {
      return next(error);
    }
  }
}

export const partnersController = new PartnersController();
