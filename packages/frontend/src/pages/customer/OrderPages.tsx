import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export function OrderHistoryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader title="My Orders" description="Track ongoing pickups, deliveries, and past dry cleaning receipts" />
      <EmptyState
        icon={<ShoppingBag className="w-8 h-8" />}
        title="No orders yet"
        description="You have not placed any dry cleaning orders yet. Schedule your first pickup now."
        actionLabel="Book a Pickup"
        onAction={() => {}}
      />
      <div className="mt-4 text-center">
        <Link to="/" className="text-sm text-primary hover:underline font-medium">
          Browse Services & Prices
        </Link>
      </div>
    </div>
  );
}

export function OrderDetailPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader title="Order Details" description="Inspect order items, assigned delivery partner, and timeline" />
      <EmptyState
        icon={<ShoppingBag className="w-8 h-8" />}
        title="Order not found"
        description="The requested order could not be loaded or has not been synced."
      />
    </div>
  );
}
