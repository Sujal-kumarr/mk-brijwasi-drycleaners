export const Roles = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  LAUNDRY_STAFF: 'LAUNDRY_STAFF',
  DELIVERY_PARTNER: 'DELIVERY_PARTNER',
  CUSTOMER: 'CUSTOMER',
} as const;

export type RoleType = (typeof Roles)[keyof typeof Roles];

export const OrderStatuses = {
  PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
  CONFIRMED: 'CONFIRMED',
  PICKUP_ASSIGNED: 'PICKUP_ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  RECEIVED_AT_LAUNDRY: 'RECEIVED_AT_LAUNDRY',
  INSPECTION_REQUIRED: 'INSPECTION_REQUIRED',
  AWAITING_CUSTOMER_APPROVAL: 'AWAITING_CUSTOMER_APPROVAL',
  PROCESSING: 'PROCESSING',
  QUALITY_CHECK: 'QUALITY_CHECK',
  READY_FOR_DELIVERY: 'READY_FOR_DELIVERY',
  DELIVERY_ASSIGNED: 'DELIVERY_ASSIGNED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  ISSUE_REPORTED: 'ISSUE_REPORTED',
} as const;

export type OrderStatusType = (typeof OrderStatuses)[keyof typeof OrderStatuses];

export const PaymentMethods = {
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
  PAY_ON_PICKUP: 'PAY_ON_PICKUP',
  ONLINE: 'ONLINE',
} as const;

export type PaymentMethodType = (typeof PaymentMethods)[keyof typeof PaymentMethods];

export const PaymentStatuses = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
} as const;

export type PaymentStatusType = (typeof PaymentStatuses)[keyof typeof PaymentStatuses];

export const NotificationChannels = {
  IN_APP: 'IN_APP',
  SMS: 'SMS',
  EMAIL: 'EMAIL',
  WHATSAPP: 'WHATSAPP',
} as const;

export type NotificationChannelType = (typeof NotificationChannels)[keyof typeof NotificationChannels];

export const NotificationStatuses = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
  SKIPPED: 'SKIPPED',
} as const;

export type NotificationStatusType = (typeof NotificationStatuses)[keyof typeof NotificationStatuses];

export const AssignmentTypes = {
  PICKUP: 'PICKUP',
  DELIVERY: 'DELIVERY',
} as const;

export type AssignmentTypeType = (typeof AssignmentTypes)[keyof typeof AssignmentTypes];

export const AssignmentStatuses = {
  ASSIGNED: 'ASSIGNED',
  ACCEPTED: 'ACCEPTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  REASSIGNED: 'REASSIGNED',
  CANCELLED: 'CANCELLED',
} as const;

export type AssignmentStatusType = (typeof AssignmentStatuses)[keyof typeof AssignmentStatuses];

export const PricingUnits = {
  PER_PIECE: 'PER_PIECE',
  PER_KG: 'PER_KG',
} as const;

export type PricingUnitType = (typeof PricingUnits)[keyof typeof PricingUnits];

export const SlotTypes = {
  PICKUP: 'PICKUP',
  DELIVERY: 'DELIVERY',
} as const;

export type SlotTypeType = (typeof SlotTypes)[keyof typeof SlotTypes];
