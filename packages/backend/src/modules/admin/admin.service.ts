import { prisma } from '../../utils/prisma';
import { ordersService } from '../orders/orders.service';
import {
  OrderStatus,
  Role,
  AssignmentType,
  AssignmentStatus,
  NotificationChannel,
  NotificationStatus,
  SlotType,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

export interface AdminOrderFilters {
  status?: OrderStatus;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class AdminService {
  async getDashboardMetrics() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      ordersToday,
      pendingConfirmation,
      inProcessing,
      readyForDelivery,
      completed,
      allActiveOrders,
      paidPayments,
    ] = await Promise.all([
      prisma.order.count({
        where: { createdAt: { gte: todayStart } },
      }),
      prisma.order.count({
        where: { status: OrderStatus.PENDING_CONFIRMATION },
      }),
      prisma.order.count({
        where: {
          status: {
            in: [
              OrderStatus.CONFIRMED,
              OrderStatus.PICKUP_ASSIGNED,
              OrderStatus.PICKED_UP,
              OrderStatus.RECEIVED_AT_LAUNDRY,
              OrderStatus.INSPECTION_REQUIRED,
              OrderStatus.AWAITING_CUSTOMER_APPROVAL,
              OrderStatus.PROCESSING,
              OrderStatus.QUALITY_CHECK,
            ],
          },
        },
      }),
      prisma.order.count({
        where: {
          status: {
            in: [
              OrderStatus.READY_FOR_DELIVERY,
              OrderStatus.DELIVERY_ASSIGNED,
              OrderStatus.OUT_FOR_DELIVERY,
            ],
          },
        },
      }),
      prisma.order.count({
        where: { status: { in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] } },
      }),
      prisma.order.findMany({
        where: { status: { not: OrderStatus.CANCELLED } },
        select: { estimatedAmountInPaise: true, finalAmountInPaise: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'PAID' },
        _sum: { amountInPaise: true },
      }),
    ]);

    const grossSalesInPaise = allActiveOrders.reduce(
      (acc, o) => acc + (o.finalAmountInPaise || o.estimatedAmountInPaise),
      0
    );
    const collectedPaymentsInPaise = paidPayments._sum.amountInPaise || 0;
    const outstandingPaymentsInPaise = Math.max(0, grossSalesInPaise - collectedPaymentsInPaise);

    // Delayed orders: scheduled pickup or delivery date was in the past and not completed/cancelled
    const now = new Date();
    const delayedOrdersCount = await prisma.order.count({
      where: {
        status: { notIn: [OrderStatus.COMPLETED, OrderStatus.DELIVERED, OrderStatus.CANCELLED] },
        deliveryDate: { lt: now },
      },
    });

    return {
      ordersToday,
      pendingConfirmation,
      inProcessing,
      readyForDelivery,
      completed,
      grossSalesInPaise,
      collectedPaymentsInPaise,
      outstandingPaymentsInPaise,
      delayedOrdersCount,
    };
  }

  async getOrders(filters: AdminOrderFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 15;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    if (filters.search) {
      const q = filters.search.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { customer: { firstName: { contains: q, mode: 'insensitive' } } },
        { customer: { lastName: { contains: q, mode: 'insensitive' } } },
        { customer: { user: { mobile: { contains: q } } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            include: {
              user: {
                select: { id: true, mobile: true, email: true },
              },
            },
          },
          pickupAddress: true,
          deliveryAddress: true,
          pickupSlot: true,
          deliverySlot: true,
          items: {
            include: {
              clothingItem: true,
              laundryService: true,
            },
          },
          assignments: {
            include: {
              partner: {
                include: {
                  user: { select: { id: true, mobile: true } },
                },
              },
            },
          },
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateOrderStatus(orderId: string, adminUserId: string, status: OrderStatus, note?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    }

    const isValid = ordersService.validateTransition(order.status, status, 'ADMIN');
    if (!isValid) {
      throw Object.assign(
        new Error(`Invalid status transition from ${order.status} to ${status}`),
        { statusCode: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          ...(status === OrderStatus.CANCELLED
            ? { cancelledAt: new Date(), cancelReason: note || 'Cancelled by administrator' }
            : {}),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          previousStatus: order.status,
          newStatus: status,
          actorId: adminUserId,
          note: note || `Order status updated to ${status} by admin`,
        },
      });

      await tx.notification.create({
        data: {
          userId: order.customer.userId,
          channel: NotificationChannel.IN_APP,
          status: NotificationStatus.SENT,
          subject: 'Order Status Update',
          body: `Your order #${order.orderNumber} is now ${status.replace(/_/g, ' ')}.`,
          orderId,
        },
      });

      return updatedOrder;
    });

    return updated;
  }

  async inspectOrder(
    orderId: string,
    adminUserId: string,
    input: {
      items: Array<{
        orderItemId: string;
        inspectedQuantity: number;
        newUnitPriceInPaise?: number;
      }>;
      note?: string;
    }
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, customer: true },
    });

    if (!order) {
      throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    }

    return prisma.$transaction(async (tx) => {
      let revisedItemsTotal = 0;

      for (const inspectedItem of input.items) {
        const item = order.items.find((i) => i.id === inspectedItem.orderItemId);
        if (!item) continue;

        const unitPrice = inspectedItem.newUnitPriceInPaise ?? item.unitPriceInPaise;
        const totalPrice = unitPrice * inspectedItem.inspectedQuantity;
        revisedItemsTotal += totalPrice;

        await tx.orderItem.update({
          where: { id: item.id },
          data: {
            inspectedQuantity: inspectedItem.inspectedQuantity,
            unitPriceInPaise: unitPrice,
            totalPriceInPaise: totalPrice,
          },
        });
      }

      const revisedFinalTotal = revisedItemsTotal + order.deliveryFeeInPaise - order.discountInPaise;
      const originalTotal = order.estimatedAmountInPaise;
      const isPriceChanged = revisedFinalTotal !== originalTotal;

      const newStatus = isPriceChanged
        ? OrderStatus.AWAITING_CUSTOMER_APPROVAL
        : OrderStatus.PROCESSING;

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          finalAmountInPaise: revisedFinalTotal,
          customerApprovalRequired: isPriceChanged,
          status: newStatus,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          previousStatus: order.status,
          newStatus,
          actorId: adminUserId,
          note: isPriceChanged
            ? `Laundry inspection complete. Revised amount: ₹${(revisedFinalTotal / 100).toFixed(2)} (Original: ₹${(originalTotal / 100).toFixed(2)}). Customer approval requested. ${input.note || ''}`
            : `Laundry inspection complete. Verified items match estimate. Processing garment care. ${input.note || ''}`,
        },
      });

      if (isPriceChanged) {
        await tx.notification.create({
          data: {
            userId: order.customer.userId,
            channel: NotificationChannel.IN_APP,
            status: NotificationStatus.SENT,
            subject: 'Order Price Revision Approval Required',
            body: `Our inspection recorded a revised order total of ₹${(revisedFinalTotal / 100).toFixed(2)}. Please review and approve in your order dashboard.`,
            orderId,
          },
        });
      }

      return updatedOrder;
    });
  }

  async assignPartner(
    orderId: string,
    adminUserId: string,
    partnerId: string,
    assignmentType: AssignmentType,
    notes?: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });
    if (!order) {
      throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    }

    const partner = await prisma.partnerProfile.findUnique({
      where: { id: partnerId },
      include: { user: true },
    });
    if (!partner) {
      throw Object.assign(new Error('Delivery partner not found'), { statusCode: 404 });
    }

    return prisma.$transaction(async (tx) => {
      // Create or update assignment
      const assignment = await tx.pickupDeliveryAssignment.create({
        data: {
          orderId,
          partnerId,
          type: assignmentType,
          status: AssignmentStatus.ASSIGNED,
          notes,
        },
      });

      const nextOrderStatus =
        assignmentType === AssignmentType.PICKUP
          ? OrderStatus.PICKUP_ASSIGNED
          : OrderStatus.DELIVERY_ASSIGNED;

      await tx.order.update({
        where: { id: orderId },
        data: { status: nextOrderStatus },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          previousStatus: order.status,
          newStatus: nextOrderStatus,
          actorId: adminUserId,
          note: `${assignmentType} task assigned to partner ${partner.firstName} ${partner.lastName} (${partner.vehicleNumber})`,
        },
      });

      // Notify Partner
      await tx.notification.create({
        data: {
          userId: partner.userId,
          channel: NotificationChannel.IN_APP,
          status: NotificationStatus.SENT,
          subject: `New ${assignmentType} Task Assigned`,
          body: `You have been assigned order #${order.orderNumber} for ${assignmentType.toLowerCase()}.`,
          orderId,
        },
      });

      // Notify Customer
      await tx.notification.create({
        data: {
          userId: order.customer.userId,
          channel: NotificationChannel.IN_APP,
          status: NotificationStatus.SENT,
          subject: `${assignmentType === AssignmentType.PICKUP ? 'Pickup' : 'Delivery'} Partner Assigned`,
          body: `Partner ${partner.firstName} (${partner.vehicleNumber}) has been assigned for order #${order.orderNumber}.`,
          orderId,
        },
      });

      return assignment;
    });
  }

  // Customers
  async getCustomers(search?: string, page = 1, limit = 15) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      const q = search.trim();
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { user: { mobile: { contains: q } } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customerProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, mobile: true, email: true, role: true, isActive: true, createdAt: true },
          },
          _count: {
            select: { orders: true, addresses: true },
          },
        },
      }),
      prisma.customerProfile.count({ where }),
    ]);

    return {
      customers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCustomerById(id: string) {
    const customer = await prisma.customerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, mobile: true, email: true, role: true, isActive: true, createdAt: true },
        },
        addresses: { where: { isActive: true } },
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
          },
        },
      },
    });

    if (!customer) {
      throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
    }

    return customer;
  }

  // Staff and Partners
  async getStaffAndPartners() {
    const [staff, partners] = await Promise.all([
      prisma.user.findMany({
        where: {
          role: { in: [Role.SUPER_ADMIN, Role.ADMIN, Role.LAUNDRY_STAFF] },
        },
        select: { id: true, mobile: true, email: true, role: true, isActive: true, createdAt: true },
      }),
      prisma.partnerProfile.findMany({
        include: {
          user: {
            select: { id: true, mobile: true, email: true, role: true, isActive: true },
          },
          _count: {
            select: { assignments: true },
          },
        },
      }),
    ]);

    return { staff, partners };
  }

  async createPartner(data: {
    mobile: string;
    firstName: string;
    lastName: string;
    vehicleNumber: string;
    serviceAreas?: string[];
    password?: string;
  }) {
    const existing = await prisma.user.findUnique({ where: { mobile: data.mobile } });
    if (existing) {
      throw Object.assign(new Error('User with this mobile already exists'), { statusCode: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password || 'Partner@1234', 12);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          mobile: data.mobile,
          passwordHash,
          role: Role.DELIVERY_PARTNER,
          isActive: true,
        },
      });

      const partnerProfile = await tx.partnerProfile.create({
        data: {
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          vehicleNumber: data.vehicleNumber,
          isAvailable: true,
          serviceAreas: data.serviceAreas || ['281121'],
        },
        include: { user: true },
      });

      return partnerProfile;
    });
  }

  async togglePartnerStatus(partnerId: string) {
    const partner = await prisma.partnerProfile.findUnique({
      where: { id: partnerId },
    });
    if (!partner) {
      throw Object.assign(new Error('Partner not found'), { statusCode: 404 });
    }

    return prisma.partnerProfile.update({
      where: { id: partnerId },
      data: { isAvailable: !partner.isAvailable },
      include: { user: true },
    });
  }

  // Business Config
  async getBusinessConfig() {
    return prisma.businessConfig.findFirst({ where: { id: 1 } });
  }

  async updateBusinessConfig(data: any) {
    return prisma.businessConfig.upsert({
      where: { id: 1 },
      update: data,
      create: {
        id: 1,
        businessName: data.businessName || 'MK Brijwasi Drycleaners',
        contactPhone: data.contactPhone || '9999999999',
        contactEmail: data.contactEmail || 'contact@mkbrijwasidrycleaners.com',
        address: data.address || 'Near Banke Bihari Temple Road, Vrindavan',
        openingHours: data.openingHours || {},
        minOrderAmountInPaise: data.minOrderAmountInPaise ?? 10000,
        deliveryFeeInPaise: data.deliveryFeeInPaise ?? 3000,
        taxPercent: data.taxPercent ?? 0,
        cancellationPolicyHours: data.cancellationPolicyHours ?? 2,
      },
    });
  }

  // Service Areas
  async getServiceAreas() {
    return prisma.serviceArea.findMany({ orderBy: { name: 'asc' } });
  }

  async createServiceArea(data: { name: string; pincode: string; isActive?: boolean }) {
    return prisma.serviceArea.create({ data });
  }

  async updateServiceArea(id: string, data: Partial<{ name: string; pincode: string; isActive: boolean }>) {
    return prisma.serviceArea.update({ where: { id }, data });
  }

  async deleteServiceArea(id: string) {
    return prisma.serviceArea.delete({ where: { id } });
  }

  // Time Slots
  async getTimeSlots() {
    return prisma.timeSlot.findMany({ orderBy: [{ slotType: 'asc' }, { startHour: 'asc' }] });
  }

  async createTimeSlot(data: { label: string; startHour: number; endHour: number; slotType: SlotType; isActive?: boolean }) {
    return prisma.timeSlot.create({ data });
  }

  async updateTimeSlot(id: string, data: Partial<{ label: string; startHour: number; endHour: number; slotType: SlotType; isActive: boolean }>) {
    return prisma.timeSlot.update({ where: { id }, data });
  }
}

export const adminService = new AdminService();
