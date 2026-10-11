import React from 'react';
import { cn } from '../../lib/utils';
import { OrderStatusType } from '@mk-drycleaners/shared';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  status?: OrderStatusType;
}

export function Badge({ className, variant = 'default', status, children, ...props }: BadgeProps) {
  let colorClasses = 'bg-gray-100 text-gray-800';

  if (status) {
    switch (status) {
      case 'PENDING_CONFIRMATION':
      case 'INSPECTION_REQUIRED':
      case 'AWAITING_CUSTOMER_APPROVAL':
        colorClasses = 'bg-amber-100 text-amber-800 border border-amber-300';
        break;
      case 'CONFIRMED':
      case 'PICKUP_ASSIGNED':
      case 'DELIVERY_ASSIGNED':
        colorClasses = 'bg-blue-100 text-blue-800 border border-blue-300';
        break;
      case 'PICKED_UP':
      case 'RECEIVED_AT_LAUNDRY':
      case 'PROCESSING':
      case 'QUALITY_CHECK':
        colorClasses = 'bg-indigo-100 text-indigo-800 border border-indigo-300';
        break;
      case 'READY_FOR_DELIVERY':
      case 'OUT_FOR_DELIVERY':
        colorClasses = 'bg-purple-100 text-purple-800 border border-purple-300';
        break;
      case 'DELIVERED':
      case 'COMPLETED':
        colorClasses = 'bg-emerald-100 text-emerald-800 border border-emerald-300';
        break;
      case 'CANCELLED':
      case 'ISSUE_REPORTED':
        colorClasses = 'bg-rose-100 text-rose-800 border border-rose-300';
        break;
      default:
        colorClasses = 'bg-gray-100 text-gray-800';
    }
  } else {
    switch (variant) {
      case 'success':
        colorClasses = 'bg-emerald-100 text-emerald-800';
        break;
      case 'warning':
        colorClasses = 'bg-amber-100 text-amber-800';
        break;
      case 'danger':
        colorClasses = 'bg-rose-100 text-rose-800';
        break;
      case 'info':
        colorClasses = 'bg-sky-100 text-sky-800';
        break;
      default:
        colorClasses = 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider',
        colorClasses,
        className
      )}
      {...props}
    >
      {children || (status ? status.replace(/_/g, ' ') : null)}
    </span>
  );
}
