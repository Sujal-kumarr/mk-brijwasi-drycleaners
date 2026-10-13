import { Request, Response, NextFunction } from 'express';
import { paymentsService } from './payments.service';

export class PaymentsController {
  async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;
      const orderId = req.query.orderId as string | undefined;
      const result = await paymentsService.getPayments(page, limit, orderId);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }

  async recordPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await paymentsService.recordPayment(req.user!.id, req.body);
      return res.status(201).json({ success: true, message: 'Payment recorded', data: payment });
    } catch (error) {
      return next(error);
    }
  }

  async refundPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const refund = await paymentsService.refundPayment(req.user!.id, req.body);
      return res.status(200).json({ success: true, message: 'Refund processed', data: refund });
    } catch (error) {
      return next(error);
    }
  }

  async getFinancialSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const dateFrom = req.query.dateFrom as string | undefined;
      const dateTo = req.query.dateTo as string | undefined;
      const summary = await paymentsService.getFinancialSummary(dateFrom, dateTo);
      return res.status(200).json({ success: true, data: summary });
    } catch (error) {
      return next(error);
    }
  }

  async recordExpense(req: Request, res: Response, next: NextFunction) {
    try {
      const expense = await paymentsService.recordExpense(req.user!.id, req.body);
      return res.status(201).json({ success: true, message: 'Expense recorded', data: expense });
    } catch (error) {
      return next(error);
    }
  }

  async getExpenses(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const result = await paymentsService.getExpenses(page, limit);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }

  async recordPartnerPayout(req: Request, res: Response, next: NextFunction) {
    try {
      const payout = await paymentsService.recordPartnerPayout(req.user!.id, req.body);
      return res.status(201).json({ success: true, message: 'Payout recorded', data: payout });
    } catch (error) {
      return next(error);
    }
  }
}

export const paymentsController = new PaymentsController();
