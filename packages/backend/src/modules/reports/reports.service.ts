import { prisma } from '../../utils/prisma';

export class ReportsService {
  async getOrderReports(period: 'daily' | 'weekly' | 'monthly' = 'daily') {
    const orders = await prisma.order.findMany({
      where: {
        status: { not: 'CANCELLED' },
      },
      select: {
        createdAt: true,
        estimatedAmountInPaise: true,
        finalAmountInPaise: true,
        status: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const groups: Record<string, { label: string; count: number; revenueInPaise: number }> = {};

    for (const o of orders) {
      let key: string;
      const d = o.createdAt;
      if (period === 'monthly') {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'weekly') {
        const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
        const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        key = `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
      } else {
        key = d.toISOString().split('T')[0];
      }

      if (!groups[key]) {
        groups[key] = { label: key, count: 0, revenueInPaise: 0 };
      }
      groups[key].count += 1;
      groups[key].revenueInPaise += o.finalAmountInPaise || o.estimatedAmountInPaise;
    }

    return Object.values(groups);
  }

  async getRevenueByService() {
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: { status: { not: 'CANCELLED' } },
      },
      include: {
        laundryService: true,
      },
    });

    const serviceStats: Record<
      string,
      { serviceId: string; serviceName: string; totalRevenueInPaise: number; totalPieces: number }
    > = {};

    for (const item of orderItems) {
      const sId = item.laundryServiceId;
      const sName = item.laundryService.name;
      if (!serviceStats[sId]) {
        serviceStats[sId] = {
          serviceId: sId,
          serviceName: sName,
          totalRevenueInPaise: 0,
          totalPieces: 0,
        };
      }
      serviceStats[sId].totalRevenueInPaise += item.totalPriceInPaise;
      serviceStats[sId].totalPieces += item.inspectedQuantity ?? item.quantity;
    }

    return Object.values(serviceStats).sort((a, b) => b.totalRevenueInPaise - a.totalRevenueInPaise);
  }

  async exportOrdersCsv(dateFrom?: string, dateTo?: string): Promise<string> {
    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          include: {
            user: { select: { mobile: true, email: true } },
          },
        },
        pickupAddress: true,
        deliveryAddress: true,
        items: true,
      },
    });

    const headers = [
      'Order Number',
      'Created Date',
      'Customer Name',
      'Mobile',
      'Status',
      'Payment Status',
      'Payment Method',
      'Items Count',
      'Total Amount (INR)',
      'Pickup Locality',
      'Delivery Locality',
    ];

    const rows = orders.map((o) => {
      const amount = ((o.finalAmountInPaise || o.estimatedAmountInPaise) / 100).toFixed(2);
      const customerName = `"${o.customer.firstName} ${o.customer.lastName}"`;
      const dateStr = o.createdAt.toISOString().replace('T', ' ').substring(0, 19);
      const itemsCount = o.items.reduce((acc, i) => acc + (i.inspectedQuantity ?? i.quantity), 0);
      const pickupLocality = `"${o.pickupAddress.locality}, ${o.pickupAddress.pincode}"`;
      const deliveryLocality = `"${o.deliveryAddress.locality}, ${o.deliveryAddress.pincode}"`;

      return [
        o.orderNumber,
        dateStr,
        customerName,
        o.customer.user.mobile,
        o.status,
        o.paymentStatus,
        o.paymentMethod,
        itemsCount,
        amount,
        pickupLocality,
        deliveryLocality,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}

export const reportsService = new ReportsService();
