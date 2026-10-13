import { Request, Response, NextFunction } from 'express';
import { reportsService } from './reports.service';

export class ReportsController {
  async getOrderReports(req: Request, res: Response, next: NextFunction) {
    try {
      const period = req.query.period as 'daily' | 'weekly' | 'monthly' | undefined;
      const data = await reportsService.getOrderReports(period || 'daily');
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }

  async getRevenueByService(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reportsService.getRevenueByService();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }

  async exportOrdersCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const dateFrom = req.query.dateFrom as string | undefined;
      const dateTo = req.query.dateTo as string | undefined;
      const csv = await reportsService.exportOrdersCsv(dateFrom, dateTo);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=orders-export-${new Date().toISOString().slice(0, 10)}.csv`
      );
      return res.status(200).send(csv);
    } catch (error) {
      return next(error);
    }
  }
}

export const reportsController = new ReportsController();
