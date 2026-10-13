import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';

export class AdminController {
  async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await adminService.getDashboardMetrics();
      return res.status(200).json({ success: true, data: metrics });
    } catch (error) {
      return next(error);
    }
  }

  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, customerId, dateFrom, dateTo, search, page, limit } = req.query;
      const result = await adminService.getOrders({
        status: status as any,
        customerId: customerId as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, note } = req.body;
      const updated = await adminService.updateOrderStatus(req.params.id, req.user!.id, status, note);
      return res.status(200).json({ success: true, message: 'Order status updated', data: updated });
    } catch (error) {
      return next(error);
    }
  }

  async inspectOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await adminService.inspectOrder(req.params.id, req.user!.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Order inspection recorded successfully',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  async assignPartner(req: Request, res: Response, next: NextFunction) {
    try {
      const { partnerId, assignmentType, notes } = req.body;
      const assignment = await adminService.assignPartner(
        req.params.id,
        req.user!.id,
        partnerId,
        assignmentType,
        notes
      );
      return res.status(200).json({
        success: true,
        message: `${assignmentType} partner assigned successfully`,
        data: assignment,
      });
    } catch (error) {
      return next(error);
    }
  }

  async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;
      const result = await adminService.getCustomers(search, page, limit);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }

  async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await adminService.getCustomerById(req.params.id);
      return res.status(200).json({ success: true, data: customer });
    } catch (error) {
      return next(error);
    }
  }

  async getStaffAndPartners(req: Request, res: Response, next: NextFunction) {
    try {
      const staffAndPartners = await adminService.getStaffAndPartners();
      return res.status(200).json({ success: true, data: staffAndPartners });
    } catch (error) {
      return next(error);
    }
  }

  async createPartner(req: Request, res: Response, next: NextFunction) {
    try {
      const partner = await adminService.createPartner(req.body);
      return res.status(201).json({ success: true, data: partner });
    } catch (error) {
      return next(error);
    }
  }

  async togglePartnerStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const partner = await adminService.togglePartnerStatus(req.params.id);
      return res.status(200).json({ success: true, data: partner });
    } catch (error) {
      return next(error);
    }
  }

  async getBusinessConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await adminService.getBusinessConfig();
      return res.status(200).json({ success: true, data: config });
    } catch (error) {
      return next(error);
    }
  }

  async updateBusinessConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await adminService.updateBusinessConfig(req.body);
      return res.status(200).json({ success: true, data: config });
    } catch (error) {
      return next(error);
    }
  }

  async getServiceAreas(req: Request, res: Response, next: NextFunction) {
    try {
      const areas = await adminService.getServiceAreas();
      return res.status(200).json({ success: true, data: areas });
    } catch (error) {
      return next(error);
    }
  }

  async createServiceArea(req: Request, res: Response, next: NextFunction) {
    try {
      const area = await adminService.createServiceArea(req.body);
      return res.status(201).json({ success: true, data: area });
    } catch (error) {
      return next(error);
    }
  }

  async updateServiceArea(req: Request, res: Response, next: NextFunction) {
    try {
      const area = await adminService.updateServiceArea(req.params.id, req.body);
      return res.status(200).json({ success: true, data: area });
    } catch (error) {
      return next(error);
    }
  }

  async deleteServiceArea(req: Request, res: Response, next: NextFunction) {
    try {
      const area = await adminService.deleteServiceArea(req.params.id);
      return res.status(200).json({ success: true, message: 'Service area deleted', data: area });
    } catch (error) {
      return next(error);
    }
  }

  async getTimeSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const slots = await adminService.getTimeSlots();
      return res.status(200).json({ success: true, data: slots });
    } catch (error) {
      return next(error);
    }
  }

  async createTimeSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const slot = await adminService.createTimeSlot(req.body);
      return res.status(201).json({ success: true, data: slot });
    } catch (error) {
      return next(error);
    }
  }

  async updateTimeSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const slot = await adminService.updateTimeSlot(req.params.id, req.body);
      return res.status(200).json({ success: true, data: slot });
    } catch (error) {
      return next(error);
    }
  }
}

export const adminController = new AdminController();
