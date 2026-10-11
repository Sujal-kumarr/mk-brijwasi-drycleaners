import { z } from 'zod';
import {
  Roles,
  OrderStatuses,
  PaymentMethods,
  PaymentStatuses,
  NotificationChannels,
  NotificationStatuses,
  AssignmentTypes,
  AssignmentStatuses,
  PricingUnits,
  SlotTypes,
} from './constants';

export const RoleEnum = z.nativeEnum(Roles);
export const OrderStatusEnum = z.nativeEnum(OrderStatuses);
export const PaymentMethodEnum = z.nativeEnum(PaymentMethods);
export const PaymentStatusEnum = z.nativeEnum(PaymentStatuses);
export const NotificationChannelEnum = z.nativeEnum(NotificationChannels);
export const NotificationStatusEnum = z.nativeEnum(NotificationStatuses);
export const AssignmentTypeEnum = z.nativeEnum(AssignmentTypes);
export const AssignmentStatusEnum = z.nativeEnum(AssignmentStatuses);
export const PricingUnitEnum = z.nativeEnum(PricingUnits);
export const SlotTypeEnum = z.nativeEnum(SlotTypes);

// Mobile number regex (Indian 10-digit mobile number)
export const mobileRegex = /^[6-9]\d{9}$/;

// Auth Schemas
export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(1, 'Last name must be at least 1 character').max(50),
  mobile: z.string().regex(mobileRegex, 'Invalid 10-digit Indian mobile number'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: RoleEnum.optional(),
});

export const loginSchema = z.object({
  mobile: z.string().regex(mobileRegex, 'Invalid 10-digit Indian mobile number'),
  password: z.string().min(1, 'Password is required'),
});

export const devLoginSchema = z.object({
  mobile: z.string().regex(mobileRegex, 'Invalid 10-digit Indian mobile number'),
  devKey: z.string().min(1, 'Development key is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// User & Profile Schemas
export const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional().or(z.literal('')),
});

// Address Schemas
export const addressSchema = z.object({
  recipientName: z.string().min(2, 'Recipient name is required'),
  mobile: z.string().regex(mobileRegex, 'Invalid mobile number'),
  addressLine: z.string().min(5, 'Address line must be at least 5 characters'),
  locality: z.string().min(2, 'Locality is required'),
  landmark: z.string().optional(),
  city: z.string().default('Vrindavan'),
  state: z.string().default('Uttar Pradesh'),
  pincode: z.string().length(6, 'Pincode must be 6 digits'),
  lat: z.number().optional(),
  lng: z.number().optional(),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = addressSchema.partial();

// Catalog Schemas
export const clothingCategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const clothingItemSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(2),
  description: z.string().optional(),
  pricingUnit: PricingUnitEnum.default('PER_PIECE'),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

export const laundryServiceSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const servicePriceSchema = z.object({
  clothingItemId: z.string().uuid(),
  laundryServiceId: z.string().uuid(),
  priceInPaise: z.number().int().positive('Price must be greater than zero'),
  minQty: z.number().int().positive().optional(),
  estimatedDays: z.number().int().default(2),
  isActive: z.boolean().default(true),
});

// Order Schemas
export const orderItemInputSchema = z.object({
  clothingItemId: z.string().uuid(),
  laundryServiceId: z.string().uuid(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  notes: z.string().optional(),
});

export const createOrderSchema = z.object({
  pickupAddressId: z.string().uuid(),
  deliveryAddressId: z.string().uuid(),
  pickupDate: z.string().or(z.date()),
  pickupSlotId: z.string().uuid(),
  deliveryDate: z.string().or(z.date()),
  deliverySlotId: z.string().uuid(),
  paymentMethod: PaymentMethodEnum,
  specialInstructions: z.string().optional(),
  items: z.array(orderItemInputSchema).min(1, 'Order must contain at least one item'),
});

export const updateOrderStatusSchema = z.object({
  status: OrderStatusEnum,
  note: z.string().optional(),
});

// Partner Schemas
export const partnerProfileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(1),
  vehicleNumber: z.string().min(3),
  isAvailable: z.boolean().default(true),
  serviceAreas: z.array(z.string()).default([]),
});

export const partnerAssignmentUpdateSchema = z.object({
  status: AssignmentStatusEnum,
  notes: z.string().optional(),
  proofImageUrl: z.string().url().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

// Payment Schemas
export const recordPaymentSchema = z.object({
  orderId: z.string().uuid(),
  amountInPaise: z.number().int().positive(),
  method: PaymentMethodEnum,
  status: PaymentStatusEnum.default('PAID'),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const refundPaymentSchema = z.object({
  paymentId: z.string().uuid(),
  amountInPaise: z.number().int().positive(),
  reason: z.string().min(5),
});

export const updateOrderInspectionSchema = z.object({
  items: z.array(
    z.object({
      orderItemId: z.string().uuid(),
      inspectedQuantity: z.number().int().min(0),
      newUnitPriceInPaise: z.number().int().positive().optional(),
    })
  ),
  note: z.string().optional(),
});

export const approvePriceChangeSchema = z.object({
  approved: z.boolean(),
});

export const businessConfigSchema = z.object({
  businessName: z.string().min(2),
  contactPhone: z.string().regex(mobileRegex),
  contactEmail: z.string().email(),
  address: z.string().min(5),
  minOrderAmountInPaise: z.number().int().positive(),
  deliveryFeeInPaise: z.number().int().min(0),
  taxPercent: z.number().min(0).max(100),
  cancellationPolicyHours: z.number().int().min(0),
});

export const serviceAreaSchema = z.object({
  name: z.string().min(2),
  pincode: z.string().length(6),
  isActive: z.boolean().default(true),
});

export const timeSlotSchema = z.object({
  label: z.string().min(2),
  startHour: z.number().int().min(0).max(23),
  endHour: z.number().int().min(1).max(24),
  slotType: SlotTypeEnum,
  isActive: z.boolean().default(true),
});

// Types inferred from Zod schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type DevLoginInput = z.infer<typeof devLoginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type ClothingCategoryInput = z.infer<typeof clothingCategorySchema>;
export type ClothingItemInput = z.infer<typeof clothingItemSchema>;
export type LaundryServiceInput = z.infer<typeof laundryServiceSchema>;
export type ServicePriceInput = z.infer<typeof servicePriceSchema>;
export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateOrderInspectionInput = z.infer<typeof updateOrderInspectionSchema>;
export type ApprovePriceChangeInput = z.infer<typeof approvePriceChangeSchema>;
export type BusinessConfigInput = z.infer<typeof businessConfigSchema>;
export type ServiceAreaInput = z.infer<typeof serviceAreaSchema>;
export type TimeSlotInput = z.infer<typeof timeSlotSchema>;
export type PartnerProfileInput = z.infer<typeof partnerProfileSchema>;
export type PartnerAssignmentUpdateInput = z.infer<typeof partnerAssignmentUpdateSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;

export interface AuthUser {
  id: string;
  mobile: string;
  role: string;
  email?: string | null;
  firstName?: string;
  lastName?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}
