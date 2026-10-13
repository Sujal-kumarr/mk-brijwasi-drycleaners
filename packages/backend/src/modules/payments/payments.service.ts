import { prisma } from '../../utils/prisma';
import { RecordPaymentInput, RefundPaymentInput } from '@mk-drycleaners/shared';
import { PaymentStatus } from '@prisma/client';

export class PaymentsService {
  async getPayments(page = 1, limit = 15, orderId?: string) {
    const skip = (page - 1) * limit;
    const where = orderId ? { orderId } : {};

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              estimatedAmountInPaise: true,
              finalAmountInPaise: true,
              customer: {
                select: { firstName: true, lastName: true },
              },
            },
          },
          recordedBy: {
            select: { id: true, mobile: true },
          },
          refunds: true,
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      payments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async recordPayment(adminUserId: string, data: RecordPaymentInput) {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { payments: true },
    });

    if (!order) {
      throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    }

    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orderId: data.orderId,
          amountInPaise: data.amountInPaise,
          method: data.method,
          status: data.status || PaymentStatus.PAID,
          reference: data.reference || `PAY-${Date.now()}`,
          recordedById: adminUserId,
          paidAt: new Date(),
          notes: data.notes || null,
        },
      });

      // Recalculate total paid
      const allPaid = await tx.payment.aggregate({
        where: { orderId: data.orderId, status: PaymentStatus.PAID },
        _sum: { amountInPaise: true },
      });

      const totalPaid = (allPaid._sum.amountInPaise || 0) + (data.status === PaymentStatus.PAID ? 0 : 0);
      const targetAmount = order.finalAmountInPaise || order.estimatedAmountInPaise;

      if (totalPaid >= targetAmount) {
        await tx.order.update({
          where: { id: data.orderId },
          data: { paymentStatus: PaymentStatus.PAID },
        });
      }

      return payment;
    });
  }

  async refundPayment(adminUserId: string, data: RefundPaymentInput) {
    const payment = await prisma.payment.findUnique({
      where: { id: data.paymentId },
      include: { order: true, refunds: true },
    });

    if (!payment) {
      throw Object.assign(new Error('Payment not found'), { statusCode: 404 });
    }

    const previousRefunded = payment.refunds.reduce((sum, r) => sum + r.amountInPaise, 0);
    const maxRefundable = payment.amountInPaise - previousRefunded;

    if (data.amountInPaise > maxRefundable) {
      throw Object.assign(
        new Error(`Cannot refund more than remaining payment amount: ₹${(maxRefundable / 100).toFixed(2)}`),
        { statusCode: 400 }
      );
    }

    return prisma.$transaction(async (tx) => {
      const refund = await tx.refund.create({
        data: {
          paymentId: data.paymentId,
          amountInPaise: data.amountInPaise,
          reason: data.reason,
          processedById: adminUserId,
        },
      });

      const newRefundTotal = previousRefunded + data.amountInPaise;
      const isFullRefund = newRefundTotal >= payment.amountInPaise;

      await tx.payment.update({
        where: { id: data.paymentId },
        data: {
          status: isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED,
        },
      });

      if (isFullRefund) {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: PaymentStatus.REFUNDED },
        });
      } else {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: PaymentStatus.PARTIALLY_REFUNDED },
        });
      }

      return refund;
    });
  }

  async getFinancialSummary(dateFrom?: string, dateTo?: string) {
    const dateFilter: any = {};
    if (dateFrom || dateTo) {
      if (dateFrom) dateFilter.gte = new Date(dateFrom);
      if (dateTo) dateFilter.lte = new Date(dateTo);
    }

    const [orders, paidPayments, refunds, payouts, expenses] = await Promise.all([
      prisma.order.findMany({
        where: {
          status: { not: 'CANCELLED' },
          ...(dateFrom || dateTo ? { createdAt: dateFilter } : {}),
        },
        select: { estimatedAmountInPaise: true, finalAmountInPaise: true },
      }),
      prisma.payment.aggregate({
        where: {
          status: 'PAID',
          ...(dateFrom || dateTo ? { paidAt: dateFilter } : {}),
        },
        _sum: { amountInPaise: true },
      }),
      prisma.refund.aggregate({
        where: dateFrom || dateTo ? { processedAt: dateFilter } : {},
        _sum: { amountInPaise: true },
      }),
      prisma.partnerPayout.aggregate({
        where: dateFrom || dateTo ? { paidAt: dateFilter } : {},
        _sum: { amountInPaise: true },
      }),
      prisma.expense.aggregate({
        where: dateFrom || dateTo ? { expenseDate: dateFilter } : {},
        _sum: { amountInPaise: true },
      }),
    ]);

    const grossSalesInPaise = orders.reduce(
      (sum, o) => sum + (o.finalAmountInPaise || o.estimatedAmountInPaise),
      0
    );
    const collectedRevenueInPaise = paidPayments._sum.amountInPaise || 0;
    const refundsInPaise = refunds._sum.amountInPaise || 0;
    const partnerPayoutsInPaise = payouts._sum.amountInPaise || 0;
    const expensesInPaise = expenses._sum.amountInPaise || 0;

    const outstandingPaymentsInPaise = Math.max(0, grossSalesInPaise - collectedRevenueInPaise);
    const netProfitInPaise =
      collectedRevenueInPaise - refundsInPaise - partnerPayoutsInPaise - expensesInPaise;

    return {
      grossSalesInPaise,
      collectedRevenueInPaise,
      outstandingPaymentsInPaise,
      refundsInPaise,
      partnerPayoutsInPaise,
      expensesInPaise,
      netProfitInPaise,
    };
  }

  async recordExpense(
    adminUserId: string,
    data: { description: string; amountInPaise: number; category: string; expenseDate?: string }
  ) {
    return prisma.expense.create({
      data: {
        description: data.description,
        amountInPaise: data.amountInPaise,
        category: data.category,
        recordedById: adminUserId,
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
      },
    });
  }

  async getExpenses(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        skip,
        take: limit,
        orderBy: { expenseDate: 'desc' },
        include: { recordedBy: { select: { id: true, mobile: true } } },
      }),
      prisma.expense.count(),
    ]);

    return {
      expenses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async recordPartnerPayout(
    adminUserId: string,
    data: { partnerId: string; amountInPaise: number; reference?: string; notes?: string }
  ) {
    const partner = await prisma.partnerProfile.findUnique({
      where: { id: data.partnerId },
    });
    if (!partner) {
      throw Object.assign(new Error('Partner profile not found'), { statusCode: 404 });
    }

    return prisma.partnerPayout.create({
      data: {
        partnerId: data.partnerId,
        amountInPaise: data.amountInPaise,
        reference: data.reference || `PO-${Date.now()}`,
        paidById: adminUserId,
        paidAt: new Date(),
        notes: data.notes || null,
      },
      include: {
        partner: true,
      },
    });
  }
}

export const paymentsService = new PaymentsService();
