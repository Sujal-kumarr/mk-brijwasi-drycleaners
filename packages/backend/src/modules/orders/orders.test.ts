import { describe, it, expect, vi } from 'vitest';
import { ordersService } from './orders.service';
import { addressesService } from '../addresses/addresses.service';
import { adminService } from '../admin/admin.service';
import { prisma } from '../../utils/prisma';
import { OrderStatus, PaymentStatus } from '@prisma/client';

vi.mock('../../utils/prisma', () => ({
  prisma: {
    serviceArea: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    customerProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    address: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    timeSlot: {
      findFirst: vi.fn(),
    },
    businessConfig: {
      findFirst: vi.fn(),
    },
    servicePrice: {
      findUnique: vi.fn(),
    },
    order: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    orderItem: {
      update: vi.fn(),
    },
    orderStatusHistory: {
      create: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    $transaction: vi.fn(async (cb: (tx: any) => Promise<any>) => {
      return cb(prisma);
    }),
  },
}));

describe('Orders and Addresses Module Integration Tests', () => {
  const mockUserId = 'usr-123';
  const mockCustomerId = 'cust-123';
  const mockPickupAddressId = 'addr-pickup';
  const mockDeliveryAddressId = 'addr-deliv';
  const mockPickupSlotId = 'slot-pickup';
  const mockDeliverySlotId = 'slot-deliv';
  const mockClothingItemId = 'item-shirt';
  const mockLaundryServiceId = 'service-dryclean';

  it('1. Address creation & serviceability validation', async () => {
    // Serviceability check
    (prisma.serviceArea.findFirst as any).mockResolvedValue({
      id: 'area-1',
      name: 'Vrindavan',
      pincode: '281121',
      isActive: true,
    });

    const serviceability = await addressesService.checkServiceability('281121');
    expect(serviceability.serviceable).toBe(true);
    expect(serviceability.pincode).toBe('281121');

    // Create address
    (prisma.customerProfile.findUnique as any).mockResolvedValue({
      id: mockCustomerId,
      userId: mockUserId,
    });
    (prisma.address.count as any).mockResolvedValue(0);
    (prisma.address.create as any).mockResolvedValue({
      id: mockPickupAddressId,
      customerId: mockCustomerId,
      recipientName: 'Radha Sharma',
      mobile: '9876543210',
      addressLine: 'Raman Reti',
      locality: 'Vrindavan',
      pincode: '281121',
      isDefault: true,
      isActive: true,
    });

    const createdAddr = await addressesService.createAddress(mockUserId, {
      recipientName: 'Radha Sharma',
      mobile: '9876543210',
      addressLine: 'Raman Reti',
      locality: 'Vrindavan',
      city: 'Vrindavan',
      state: 'Uttar Pradesh',
      pincode: '281121',
      isDefault: true,
    });

    expect(createdAddr.id).toBe(mockPickupAddressId);
    expect(createdAddr.isDefault).toBe(true);
  });

  it('2. Order creation with backend pricing calculation & min order validation', async () => {
    (prisma.customerProfile.findUnique as any).mockResolvedValue({
      id: mockCustomerId,
      userId: mockUserId,
    });

    (prisma.address.findFirst as any).mockImplementation(({ where }: any) => {
      return { id: where.id, customerId: mockCustomerId, isActive: true };
    });

    (prisma.timeSlot.findFirst as any).mockResolvedValue({
      id: 'slot-id',
      isActive: true,
    });

    (prisma.businessConfig.findFirst as any).mockResolvedValue({
      deliveryFeeInPaise: 3000,
      minOrderAmountInPaise: 10000,
    });

    // Mock pricing: ₹70 (7000 paise) per item
    (prisma.servicePrice.findUnique as any).mockResolvedValue({
      clothingItemId: mockClothingItemId,
      laundryServiceId: mockLaundryServiceId,
      priceInPaise: 7000,
      isActive: true,
      clothingItem: { isActive: true },
    });

    // Mock order creation in tx
    (prisma.order.create as any).mockImplementation(({ data }: any) => {
      return {
        id: 'ord-101',
        orderNumber: data.orderNumber,
        customerId: mockCustomerId,
        status: data.status,
        estimatedAmountInPaise: data.estimatedAmountInPaise,
        deliveryFeeInPaise: data.deliveryFeeInPaise,
        items: data.items.create,
      };
    });

    // 2 items * ₹70 = ₹140 (14000 paise). Delivery fee = ₹30 (3000 paise). Total = ₹170 (17000 paise).
    const createdOrder = await ordersService.createOrder(mockUserId, {
      pickupAddressId: mockPickupAddressId,
      deliveryAddressId: mockDeliveryAddressId,
      pickupDate: '2026-10-15',
      pickupSlotId: mockPickupSlotId,
      deliveryDate: '2026-10-17',
      deliverySlotId: mockDeliverySlotId,
      paymentMethod: 'CASH_ON_DELIVERY',
      items: [
        {
          clothingItemId: mockClothingItemId,
          laundryServiceId: mockLaundryServiceId,
          quantity: 2,
        },
      ],
    });

    expect(createdOrder.id).toBe('ord-101');
    expect(createdOrder.status).toBe(OrderStatus.PENDING_CONFIRMATION);
    expect(createdOrder.estimatedAmountInPaise).toBe(17000); // 14000 items + 3000 delivery fee
  });

  it('3. State machine validates status progression and forbids illegal transitions', () => {
    // Valid transitions
    expect(
      ordersService.validateTransition(
        OrderStatus.PENDING_CONFIRMATION,
        OrderStatus.CONFIRMED,
        'ADMIN'
      )
    ).toBe(true);

    expect(
      ordersService.validateTransition(
        OrderStatus.CONFIRMED,
        OrderStatus.PICKUP_ASSIGNED,
        'ADMIN'
      )
    ).toBe(true);

    expect(
      ordersService.validateTransition(
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.DELIVERED,
        'DELIVERY_PARTNER'
      )
    ).toBe(true);

    // Forbidden transitions
    expect(
      ordersService.validateTransition(
        OrderStatus.PENDING_CONFIRMATION,
        OrderStatus.DELIVERED,
        'ADMIN'
      )
    ).toBe(false);

    // Customer cannot jump straight to completed or cancel after picked up
    expect(
      ordersService.validateTransition(
        OrderStatus.PROCESSING,
        OrderStatus.CANCELLED,
        'CUSTOMER'
      )
    ).toBe(false);
  });

  it('4. Inspection price change and customer approval flow', async () => {
    const mockOrder = {
      id: 'ord-101',
      orderNumber: 'MK-20261013-ABCD',
      status: OrderStatus.RECEIVED_AT_LAUNDRY,
      estimatedAmountInPaise: 17000,
      deliveryFeeInPaise: 3000,
      discountInPaise: 0,
      customer: { userId: mockUserId },
      items: [
        {
          id: 'item-row-1',
          clothingItemId: mockClothingItemId,
          laundryServiceId: mockLaundryServiceId,
          quantity: 2,
          unitPriceInPaise: 7000,
          totalPriceInPaise: 14000,
        },
      ],
    };

    (prisma.order.findUnique as any).mockResolvedValue(mockOrder);
    (prisma.order.update as any).mockImplementation(({ data }: any) => ({
      ...mockOrder,
      ...data,
    }));

    // Admin inspects order: customer had 3 shirts instead of 2.
    // New item total = 3 * 7000 = 21000. Plus delivery fee 3000 = 24000.
    const inspected = await adminService.inspectOrder('ord-101', 'admin-id', {
      items: [{ orderItemId: 'item-row-1', inspectedQuantity: 3 }],
      note: 'Found 1 additional shirt in laundry bag',
    });

    expect(inspected.customerApprovalRequired).toBe(true);
    expect(inspected.status).toBe(OrderStatus.AWAITING_CUSTOMER_APPROVAL);
    expect(inspected.finalAmountInPaise).toBe(24000);

    // Customer approves price change
    (prisma.order.findUnique as any).mockResolvedValue({
      ...mockOrder,
      status: OrderStatus.AWAITING_CUSTOMER_APPROVAL,
      finalAmountInPaise: 24000,
      customerApprovalRequired: true,
    });

    const approvedOrder = await ordersService.approvePriceChange('ord-101', mockUserId, true);
    expect(approvedOrder.status).toBe(OrderStatus.PROCESSING);
    expect(approvedOrder.customerApprovalRequired).toBe(false);
  });

  it('5. Rejects unauthorized cancellation or illegal customer action', async () => {
    (prisma.order.findUnique as any).mockResolvedValue({
      id: 'ord-101',
      customer: { userId: 'different-user' },
      status: OrderStatus.PENDING_CONFIRMATION,
    });

    // Customer attempting to cancel someone else's order
    await expect(
      ordersService.cancelOrder('ord-101', mockUserId, 'CUSTOMER', 'Cancelled')
    ).rejects.toThrow('Unauthorized to cancel this order');
  });
});
