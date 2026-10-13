import { prisma } from '../../utils/prisma';
import {
  CreateOrderInput,
  OrderStatusType,
  RoleType,
} from '@mk-drycleaners/shared';
import {
  OrderStatus,
  PaymentStatus,
  NotificationChannel,
  NotificationStatus,
} from '@prisma/client';

export class OrdersService {
  /**
   * State Machine Validator
   */
  validateTransition(fromStatus: OrderStatus, toStatus: OrderStatus, role: RoleType): boolean {
    if (fromStatus === toStatus) return true;
    if (toStatus === OrderStatus.ISSUE_REPORTED) return true;

    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING_CONFIRMATION]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PICKUP_ASSIGNED, OrderStatus.CANCELLED],
      [OrderStatus.PICKUP_ASSIGNED]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
      [OrderStatus.PICKED_UP]: [OrderStatus.RECEIVED_AT_LAUNDRY],
      [OrderStatus.RECEIVED_AT_LAUNDRY]: [OrderStatus.INSPECTION_REQUIRED, OrderStatus.PROCESSING],
      [OrderStatus.INSPECTION_REQUIRED]: [OrderStatus.AWAITING_CUSTOMER_APPROVAL, OrderStatus.PROCESSING],
      [OrderStatus.AWAITING_CUSTOMER_APPROVAL]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.QUALITY_CHECK],
      [OrderStatus.QUALITY_CHECK]: [OrderStatus.READY_FOR_DELIVERY],
      [OrderStatus.READY_FOR_DELIVERY]: [OrderStatus.DELIVERY_ASSIGNED],
      [OrderStatus.DELIVERY_ASSIGNED]: [OrderStatus.OUT_FOR_DELIVERY],
      [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.ISSUE_REPORTED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED, OrderStatus.READY_FOR_DELIVERY],
    };

    const nextOptions = allowedTransitions[fromStatus] || [];
    if (!nextOptions.includes(toStatus)) {
      return false;
    }

    // Role-specific constraints
    if (role === 'CUSTOMER') {
      // Customer can only cancel during pending confirmation or confirmed, or approve/reject price change
      if (toStatus === OrderStatus.CANCELLED) {
        return (
          fromStatus === OrderStatus.PENDING_CONFIRMATION ||
          fromStatus === OrderStatus.CONFIRMED ||
          fromStatus === OrderStatus.AWAITING_CUSTOMER_APPROVAL
        );
      }
      if (toStatus === OrderStatus.PROCESSING && fromStatus === OrderStatus.AWAITING_CUSTOMER_APPROVAL) {
        return true;
      }
      return false;
    }

    if (role === 'DELIVERY_PARTNER') {
      if (fromStatus === OrderStatus.PICKUP_ASSIGNED && toStatus === OrderStatus.PICKED_UP) return true;
      if (fromStatus === OrderStatus.OUT_FOR_DELIVERY && toStatus === OrderStatus.DELIVERED) return true;
      return false;
    }

    return true; // SUPER_ADMIN, ADMIN, LAUNDRY_STAFF
  }

  /**
   * Helper to generate unique order number: MK-YYYYMMDD-XXXX
   */
  private generateOrderNumber(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `MK-${yyyy}${mm}${dd}-${randomHex}`;
  }

  async createOrder(userId: string, data: CreateOrderInput) {
    // 1. Resolve Customer Profile
    let customerProfile = await prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!customerProfile) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      customerProfile = await prisma.customerProfile.create({
        data: {
          userId,
          firstName: 'Customer',
          lastName: user?.mobile.slice(-4) || 'User',
        },
      });
    }

    // 2. Validate Addresses
    const [pickupAddr, deliveryAddr] = await Promise.all([
      prisma.address.findFirst({
        where: { id: data.pickupAddressId, customerId: customerProfile.id, isActive: true },
      }),
      prisma.address.findFirst({
        where: { id: data.deliveryAddressId, customerId: customerProfile.id, isActive: true },
      }),
    ]);

    if (!pickupAddr) {
      throw Object.assign(new Error('Invalid or unauthorized pickup address'), { statusCode: 400 });
    }
    if (!deliveryAddr) {
      throw Object.assign(new Error('Invalid or unauthorized delivery address'), { statusCode: 400 });
    }

    // 3. Validate Time Slots
    const [pickupSlot, deliverySlot] = await Promise.all([
      prisma.timeSlot.findFirst({
        where: { id: data.pickupSlotId, isActive: true },
      }),
      prisma.timeSlot.findFirst({
        where: { id: data.deliverySlotId, isActive: true },
      }),
    ]);

    if (!pickupSlot || !deliverySlot) {
      throw Object.assign(new Error('Invalid or inactive time slot selected'), { statusCode: 400 });
    }

    // 4. Business Config
    const config = await prisma.businessConfig.findFirst({ where: { id: 1 } });
    const deliveryFeeInPaise = config ? config.deliveryFeeInPaise : 3000;
    const minOrderAmountInPaise = config ? config.minOrderAmountInPaise : 10000;

    // 5. Calculate Server-side Item Pricing Snapshot
    let itemsTotalInPaise = 0;
    const itemSnapshots: Array<{
      clothingItemId: string;
      laundryServiceId: string;
      quantity: number;
      unitPriceInPaise: number;
      totalPriceInPaise: number;
      notes: string | null;
    }> = [];

    for (const item of data.items) {
      const servicePrice = await prisma.servicePrice.findUnique({
        where: {
          clothingItemId_laundryServiceId: {
            clothingItemId: item.clothingItemId,
            laundryServiceId: item.laundryServiceId,
          },
        },
        include: {
          clothingItem: true,
          laundryService: true,
        },
      });

      if (!servicePrice || !servicePrice.isActive || !servicePrice.clothingItem.isActive) {
        throw Object.assign(
          new Error(`Pricing not available for selected item and service combination`),
          { statusCode: 400 }
        );
      }

      const unitPriceInPaise = servicePrice.priceInPaise;
      const totalPriceInPaise = unitPriceInPaise * item.quantity;
      itemsTotalInPaise += totalPriceInPaise;

      itemSnapshots.push({
        clothingItemId: item.clothingItemId,
        laundryServiceId: item.laundryServiceId,
        quantity: item.quantity,
        unitPriceInPaise,
        totalPriceInPaise,
        notes: item.notes || null,
      });
    }

    if (itemsTotalInPaise < minOrderAmountInPaise) {
      throw Object.assign(
        new Error(`Minimum order value is ₹${(minOrderAmountInPaise / 100).toFixed(2)}. Current items: ₹${(itemsTotalInPaise / 100).toFixed(2)}`),
        { statusCode: 400 }
      );
    }

    const estimatedAmountInPaise = itemsTotalInPaise + deliveryFeeInPaise;
    const orderNumber = this.generateOrderNumber();

    // 6. Prisma Transaction
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId: customerProfile.id,
          pickupAddressId: data.pickupAddressId,
          deliveryAddressId: data.deliveryAddressId,
          pickupDate: new Date(data.pickupDate),
          pickupSlotId: data.pickupSlotId,
          deliveryDate: new Date(data.deliveryDate),
          deliverySlotId: data.deliverySlotId,
          status: OrderStatus.PENDING_CONFIRMATION,
          estimatedAmountInPaise,
          deliveryFeeInPaise,
          paymentMethod: data.paymentMethod,
          paymentStatus: PaymentStatus.PENDING,
          specialInstructions: data.specialInstructions || null,
          items: {
            create: itemSnapshots,
          },
          statusHistory: {
            create: {
              previousStatus: null,
              newStatus: OrderStatus.PENDING_CONFIRMATION,
              actorId: userId,
              note: 'Order placed by customer via platform',
            },
          },
        },
        include: {
          items: {
            include: {
              clothingItem: true,
              laundryService: true,
            },
          },
          pickupAddress: true,
          deliveryAddress: true,
          pickupSlot: true,
          deliverySlot: true,
          statusHistory: true,
        },
      });

      // In-app Notification
      await tx.notification.create({
        data: {
          userId,
          channel: NotificationChannel.IN_APP,
          status: NotificationStatus.SENT,
          subject: 'Order Created',
          body: `Your dry cleaning order ${orderNumber} has been received! Our team is preparing your pickup.`,
          orderId: createdOrder.id,
        },
      });

      return createdOrder;
    });

    return order;
  }

  async getCustomerOrders(userId: string, page = 1, limit = 10) {
    const customerProfile = await prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!customerProfile) {
      return { orders: [], total: 0, page, totalPages: 0 };
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { customerId: customerProfile.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              clothingItem: true,
              laundryService: true,
            },
          },
          pickupAddress: true,
          deliveryAddress: true,
          pickupSlot: true,
          deliverySlot: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
        },
      }),
      prisma.order.count({ where: { customerId: customerProfile.id } }),
    ]);

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrderById(orderId: string, userId: string, userRole: RoleType) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          include: {
            actor: {
              select: { id: true, role: true, mobile: true },
            },
          },
        },
        assignments: {
          include: {
            partner: {
              include: {
                user: {
                  select: { id: true, mobile: true },
                },
              },
            },
            events: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    }

    // Role-based visibility check
    if (userRole === 'CUSTOMER') {
      const customerProfile = await prisma.customerProfile.findUnique({
        where: { userId },
      });
      if (!customerProfile || order.customerId !== customerProfile.id) {
        throw Object.assign(new Error('Access denied to this order'), { statusCode: 403 });
      }
    } else if (userRole === 'DELIVERY_PARTNER') {
      const partnerProfile = await prisma.partnerProfile.findUnique({
        where: { userId },
      });
      const isAssigned = order.assignments.some((a) => a.partnerId === partnerProfile?.id);
      if (!isAssigned) {
        throw Object.assign(new Error('Access denied to this order'), { statusCode: 403 });
      }
    }

    return order;
  }

  async cancelOrder(orderId: string, userId: string, userRole: RoleType, reason: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
      },
    });

    if (!order) {
      throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    }

    if (userRole === 'CUSTOMER') {
      if (order.customer.userId !== userId) {
        throw Object.assign(new Error('Unauthorized to cancel this order'), { statusCode: 403 });
      }
      if (
        order.status !== OrderStatus.PENDING_CONFIRMATION &&
        order.status !== OrderStatus.CONFIRMED &&
        order.status !== OrderStatus.AWAITING_CUSTOMER_APPROVAL
      ) {
        throw Object.assign(
          new Error('Order cannot be cancelled at its current stage. Please contact support.'),
          { statusCode: 400 }
        );
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const cancelledOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelReason: reason || 'Cancelled by customer',
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          previousStatus: order.status,
          newStatus: OrderStatus.CANCELLED,
          actorId: userId,
          note: `Order cancelled: ${reason || 'No reason provided'}`,
        },
      });

      await tx.notification.create({
        data: {
          userId: order.customer.userId,
          channel: NotificationChannel.IN_APP,
          status: NotificationStatus.SENT,
          subject: 'Order Cancelled',
          body: `Order ${order.orderNumber} has been cancelled.`,
          orderId,
        },
      });

      return cancelledOrder;
    });

    return updated;
  }

  async approvePriceChange(orderId: string, userId: string, approved: boolean) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    }

    if (order.customer.userId !== userId) {
      throw Object.assign(new Error('Unauthorized to modify this order'), { statusCode: 403 });
    }

    if (order.status !== OrderStatus.AWAITING_CUSTOMER_APPROVAL) {
      throw Object.assign(
        new Error('Order is not currently awaiting customer price approval'),
        { statusCode: 400 }
      );
    }

    if (approved) {
      const updated = await prisma.$transaction(async (tx) => {
        const res = await tx.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.PROCESSING,
            customerApprovalRequired: false,
            customerApprovedAt: new Date(),
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId,
            previousStatus: order.status,
            newStatus: OrderStatus.PROCESSING,
            actorId: userId,
            note: `Customer approved revised inspection price (Total: ₹${((order.finalAmountInPaise || order.estimatedAmountInPaise) / 100).toFixed(2)})`,
          },
        });

        await tx.notification.create({
          data: {
            userId,
            channel: NotificationChannel.IN_APP,
            status: NotificationStatus.SENT,
            subject: 'Price Approval Confirmed',
            body: `You approved the revised order total. Processing has commenced.`,
            orderId,
          },
        });

        return res;
      });

      return updated;
    } else {
      // Customer rejected price change -> Cancel order
      const updated = await prisma.$transaction(async (tx) => {
        const res = await tx.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.CANCELLED,
            customerApprovalRequired: false,
            cancelledAt: new Date(),
            cancelReason: 'Customer rejected post-inspection revised price quote',
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId,
            previousStatus: order.status,
            newStatus: OrderStatus.CANCELLED,
            actorId: userId,
            note: 'Customer rejected post-inspection revised quote. Order cancelled.',
          },
        });

        await tx.notification.create({
          data: {
            userId,
            channel: NotificationChannel.IN_APP,
            status: NotificationStatus.SENT,
            subject: 'Order Cancelled',
            body: `You declined the revised quote. Order ${order.orderNumber} has been cancelled.`,
            orderId,
          },
        });

        return res;
      });

      return updated;
    }
  }
}

export const ordersService = new OrdersService();
