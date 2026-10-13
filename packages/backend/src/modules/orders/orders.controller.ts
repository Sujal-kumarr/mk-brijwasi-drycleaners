import { Request, Response, NextFunction } from 'express';
import { ordersService } from './orders.service';

export class OrdersController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await ordersService.createOrder(req.user!.id, req.body);
      return res.status(201).json({ success: true, data: order });
    } catch (error) {
      return next(error);
    }
  }

  async getCustomerOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const result = await ordersService.getCustomerOrders(req.user!.id, page, limit);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await ordersService.getOrderById(req.params.id, req.user!.id, req.user!.role);
      return res.status(200).json({ success: true, data: order });
    } catch (error) {
      return next(error);
    }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const reason = req.body?.reason || 'Cancelled by customer';
      const order = await ordersService.cancelOrder(req.params.id, req.user!.id, req.user!.role, reason);
      return res.status(200).json({ success: true, message: 'Order cancelled successfully', data: order });
    } catch (error) {
      return next(error);
    }
  }

  async approvePriceChange(req: Request, res: Response, next: NextFunction) {
    try {
      const { approved } = req.body;
      const order = await ordersService.approvePriceChange(req.params.id, req.user!.id, approved);
      return res.status(200).json({
        success: true,
        message: approved ? 'Price adjustment approved' : 'Price adjustment declined',
        data: order,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export const ordersController = new OrdersController();
