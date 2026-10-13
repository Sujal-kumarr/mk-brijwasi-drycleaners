import { prisma } from '../../utils/prisma';
import { PartnerAssignmentUpdateInput } from '@mk-drycleaners/shared';
import {
  AssignmentStatus,
  AssignmentType,
  OrderStatus,
  NotificationChannel,
  NotificationStatus,
} from '@prisma/client';

export class PartnersService {
  async getPartnerProfile(userId: string) {
    const profile = await prisma.partnerProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, mobile: true, email: true, isActive: true } },
      },
    });

    if (!profile) {
      throw Object.assign(new Error('Partner profile not found for this account'), { statusCode: 404 });
    }

    return profile;
  }

  async updateAvailability(userId: string, isAvailable: boolean) {
    const profile = await this.getPartnerProfile(userId);
    return prisma.partnerProfile.update({
      where: { id: profile.id },
      data: { isAvailable },
    });
  }

  async getAssignedJobs(userId: string, status?: AssignmentStatus) {
    const profile = await this.getPartnerProfile(userId);

    const where: any = {
      partnerId: profile.id,
    };

    if (status) {
      where.status = status;
    }

    return prisma.pickupDeliveryAssignment.findMany({
      where,
      orderBy: { assignedAt: 'desc' },
      include: {
        order: {
          include: {
            customer: {
              include: {
                user: { select: { mobile: true, email: true } },
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
          },
        },
        events: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async getJobDetails(userId: string, assignmentId: string) {
    const profile = await this.getPartnerProfile(userId);

    const assignment = await prisma.pickupDeliveryAssignment.findFirst({
      where: {
        id: assignmentId,
        partnerId: profile.id,
      },
      include: {
        order: {
          include: {
            customer: {
              include: {
                user: { select: { mobile: true, email: true } },
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
            },
          },
        },
        events: {
          orderBy: { createdAt: 'desc' },
        },
        earning: true,
      },
    });

    if (!assignment) {
      throw Object.assign(new Error('Assignment not found or unauthorized'), { statusCode: 404 });
    }

    return assignment;
  }

  async updateJobStatus(userId: string, assignmentId: string, update: PartnerAssignmentUpdateInput) {
    const profile = await this.getPartnerProfile(userId);

    const assignment = await prisma.pickupDeliveryAssignment.findFirst({
      where: {
        id: assignmentId,
        partnerId: profile.id,
      },
      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!assignment) {
      throw Object.assign(new Error('Assignment not found or unauthorized'), { statusCode: 404 });
    }

    return prisma.$transaction(async (tx) => {
      const now = new Date();
      const isCompleted = update.status === AssignmentStatus.COMPLETED;
      const isAccepted = update.status === AssignmentStatus.ACCEPTED;

      // 1. Update assignment
      const updatedAssignment = await tx.pickupDeliveryAssignment.update({
        where: { id: assignmentId },
        data: {
          status: update.status,
          ...(isAccepted && !assignment.acceptedAt ? { acceptedAt: now } : {}),
          ...(isCompleted ? { completedAt: now } : {}),
          ...(update.notes ? { notes: update.notes } : {}),
        },
      });

      // 2. Log event
      await tx.pickupDeliveryEvent.create({
        data: {
          assignmentId,
          eventType: update.status,
          note: update.notes || null,
          proofImageUrl: update.proofImageUrl || null,
          lat: update.lat || null,
          lng: update.lng || null,
        },
      });

      // 3. Update order status if completed
      if (isCompleted) {
        if (assignment.type === AssignmentType.PICKUP) {
          await tx.order.update({
            where: { id: assignment.orderId },
            data: { status: OrderStatus.PICKED_UP },
          });

          await tx.orderStatusHistory.create({
            data: {
              orderId: assignment.orderId,
              previousStatus: assignment.order.status,
              newStatus: OrderStatus.PICKED_UP,
              actorId: userId,
              note: `Garments picked up by ${profile.firstName} ${profile.lastName}. Proof: ${update.notes || 'Bag collected'}`,
            },
          });

          await tx.notification.create({
            data: {
              userId: assignment.order.customer.userId,
              channel: NotificationChannel.IN_APP,
              status: NotificationStatus.SENT,
              subject: 'Garments Picked Up',
              body: `Your laundry for order #${assignment.order.orderNumber} has been successfully collected and is on its way to the laundry facility.`,
              orderId: assignment.orderId,
            },
          });
        } else if (assignment.type === AssignmentType.DELIVERY) {
          await tx.order.update({
            where: { id: assignment.orderId },
            data: { status: OrderStatus.DELIVERED },
          });

          await tx.orderStatusHistory.create({
            data: {
              orderId: assignment.orderId,
              previousStatus: assignment.order.status,
              newStatus: OrderStatus.DELIVERED,
              actorId: userId,
              note: `Garments delivered by ${profile.firstName} ${profile.lastName}. Confirmation: ${update.notes || 'Handed to customer'}`,
            },
          });

          await tx.notification.create({
            data: {
              userId: assignment.order.customer.userId,
              channel: NotificationChannel.IN_APP,
              status: NotificationStatus.SENT,
              subject: 'Order Delivered!',
              body: `Your crisp and fresh dry-cleaned garments for order #${assignment.order.orderNumber} have been delivered! Thank you for choosing MK Brijwasi Drycleaners.`,
              orderId: assignment.orderId,
            },
          });
        }

        // 4. Credit Partner Earning (Fixed ₹40 per completed run)
        const earningAmountInPaise = 4000;
        const existingEarning = await tx.partnerEarning.findUnique({
          where: { assignmentId },
        });

        if (!existingEarning) {
          await tx.partnerEarning.create({
            data: {
              partnerId: profile.id,
              assignmentId,
              amountInPaise: earningAmountInPaise,
              note: `Earning for completed ${assignment.type.toLowerCase()} run on order #${assignment.order.orderNumber}`,
            },
          });
        }
      }

      return updatedAssignment;
    });
  }

  async getEarnings(userId: string) {
    const profile = await this.getPartnerProfile(userId);
    return prisma.partnerEarning.findMany({
      where: { partnerId: profile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        assignment: {
          include: {
            order: {
              select: { id: true, orderNumber: true, status: true },
            },
          },
        },
      },
    });
  }

  async getEarningsSummary(userId: string) {
    const profile = await this.getPartnerProfile(userId);

    const [earningsAgg, payoutsAgg, earningsList, payoutsList] = await Promise.all([
      prisma.partnerEarning.aggregate({
        where: { partnerId: profile.id },
        _sum: { amountInPaise: true },
        _count: { id: true },
      }),
      prisma.partnerPayout.aggregate({
        where: { partnerId: profile.id },
        _sum: { amountInPaise: true },
      }),
      prisma.partnerEarning.findMany({
        where: { partnerId: profile.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.partnerPayout.findMany({
        where: { partnerId: profile.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const totalEarnedInPaise = earningsAgg._sum.amountInPaise || 0;
    const totalPaidInPaise = payoutsAgg._sum.amountInPaise || 0;
    const unpaidBalanceInPaise = Math.max(0, totalEarnedInPaise - totalPaidInPaise);

    return {
      totalEarnedInPaise,
      totalPaidInPaise,
      unpaidBalanceInPaise,
      completedRunsCount: earningsAgg._count.id || 0,
      recentEarnings: earningsList,
      recentPayouts: payoutsList,
    };
  }
}

export const partnersService = new PartnersService();
