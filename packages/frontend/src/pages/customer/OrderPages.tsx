import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useFetch, useMutate } from '../../hooks/useApi';
import { api } from '../../lib/api';
import {
  ShoppingBag,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function OrderHistoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useFetch<any>(
    ['userOrders', page],
    `/orders?page=${page}&limit=10`
  );

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader
        title="My Orders"
        description="Track ongoing pickups, deliveries, and past dry cleaning receipts"
      >
        <Link to="/book">
          <Button variant="primary" size="sm">
            <ShoppingBag className="w-4 h-4 mr-1.5" /> Schedule New Pickup
          </Button>
        </Link>
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="No orders yet"
          description="You haven't placed any dry cleaning or laundry orders yet. Experience doorstep garment care in Vrindavan."
          actionLabel="Book a Pickup Now"
          onAction={() => (window.location.href = '/book')}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((ord: any) => (
            <Card
              key={ord.id}
              className="hover:border-primary/40 transition shadow-sm overflow-hidden"
            >
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-slate-900 tracking-wide">
                      {ord.orderNumber}
                    </span>
                    <Badge status={ord.status} />
                    {ord.customerApprovalRequired && (
                      <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                        Price Approval Needed
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    Placed: {new Date(ord.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl mb-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Pickup</span>
                    <span className="font-medium text-slate-800">
                      {new Date(ord.pickupDate).toLocaleDateString()} ({ord.pickupSlot?.label})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Delivery</span>
                    <span className="font-medium text-slate-800">
                      {new Date(ord.deliveryDate).toLocaleDateString()} ({ord.deliverySlot?.label})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Amount</span>
                    <span className="font-bold text-primary text-sm">
                      ₹
                      {(
                        (ord.finalAmountInPaise ?? ord.estimatedAmountInPaise) /
                        100
                      ).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">
                      ({ord.paymentStatus})
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-slate-500">
                    {ord.items?.length || 0} garment category types
                  </span>
                  <Link to={`/orders/${ord.id}`}>
                    <Button variant="outline" size="sm" className="text-xs font-semibold">
                      Track & View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-xs text-slate-600 font-semibold px-2">
                Page {page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, refetch } = useFetch<any>(
    ['orderDetail', id],
    `/orders/${id}`
  );

  const approveMutation = useMutate(
    async (approved: boolean) => {
      const res = await api.post(`/orders/${id}/approve-price`, { approved });
      return res.data;
    },
    [['orderDetail', id], ['userOrders']]
  );

  const cancelMutation = useMutate(
    async (reason: string) => {
      const res = await api.post(`/orders/${id}/cancel`, { reason });
      return res.data;
    },
    [['orderDetail', id], ['userOrders']]
  );

  const handleApprovePrice = (approved: boolean) => {
    approveMutation.mutate(approved, {
      onSuccess: () => {
        toast.success(
          approved
            ? 'Price adjustment accepted. Cleaning started!'
            : 'Price revision declined. Order cancelled.'
        );
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.error || 'Action failed');
      },
    });
  };

  const handleCancelOrder = () => {
    const reason = prompt('Please state the cancellation reason:');
    if (!reason) return;
    cancelMutation.mutate(reason, {
      onSuccess: () => toast.success('Order has been cancelled'),
      onError: (err: any) => toast.error(err.response?.data?.error || 'Cancellation failed'),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title="Order Not Found"
          description="The requested order could not be located."
          actionLabel="Go to Order History"
          onAction={() => navigate('/orders')}
        />
      </div>
    );
  }

  const canCancel =
    order.status === 'PENDING_CONFIRMATION' || order.status === 'CONFIRMED';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900">{order.orderNumber}</h1>
            <Badge status={order.status} />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Booked on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
              onClick={handleCancelOrder}
              isLoading={cancelMutation.isPending}
            >
              Cancel Order
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Price Revision Approval Banner */}
      {order.customerApprovalRequired && (
        <Card className="border-amber-300 bg-amber-50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="font-bold text-amber-900 text-sm">
                    Laundry Inspection Price Adjustment Requires Your Approval
                  </h3>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    Our inspection master checked your items at the processing plant. Some garments or
                    stains required revision.
                  </p>
                </div>
                <div className="flex gap-4 text-xs">
                  <div>
                    <span className="text-amber-700 block text-[11px]">Initial Estimate:</span>
                    <span className="line-through text-slate-500 font-semibold">
                      ₹{(order.estimatedAmountInPaise / 100).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-700 block text-[11px]">Proposed Final:</span>
                    <span className="font-black text-amber-900 text-base">
                      ₹{((order.finalAmountInPaise ?? order.estimatedAmountInPaise) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="primary"
                    isLoading={approveMutation.isPending}
                    onClick={() => handleApprovePrice(true)}
                  >
                    Accept Revised Price & Start Cleaning
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-amber-300 text-amber-900 hover:bg-amber-100"
                    onClick={() => handleApprovePrice(false)}
                  >
                    Reject & Return Clothes
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Order Lifecycle Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.statusHistory?.map((history: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1 flex-shrink-0 ring-4 ring-primary/10" />
                <div className="flex-1 pb-3 border-b border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">
                      {history.newStatus.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(history.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {history.note && (
                    <p className="text-slate-500 text-xs mt-0.5">{history.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Garments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" /> Inspected Garments & Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Garment</th>
                  <th className="py-2.5 px-4">Service</th>
                  <th className="py-2.5 px-4 text-center">Initial Qty</th>
                  <th className="py-2.5 px-4 text-center">Inspected Qty</th>
                  <th className="py-2.5 px-4 text-right">Unit Rate</th>
                  <th className="py-2.5 px-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items?.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      {item.clothingItem?.name}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {item.laundryService?.name}
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-600 font-medium">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-4 text-center font-bold text-slate-900">
                      {item.inspectedQuantity ?? item.quantity}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-500">
                      ₹{(item.unitPriceInPaise / 100).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                      ₹
                      {(
                        ((item.inspectedQuantity ?? item.quantity) *
                          item.unitPriceInPaise) /
                        100
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-end gap-1 text-xs pt-4 border-t border-slate-100 mt-4 text-slate-600">
            <div>
              Delivery Fee: ₹{(order.deliveryFeeInPaise / 100).toFixed(2)}
            </div>
            <div className="text-base font-extrabold text-slate-900">
              Total Amount:{' '}
              <span className="text-primary">
                ₹
                {(
                  (order.finalAmountInPaise ?? order.estimatedAmountInPaise) /
                  100
                ).toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Payment Method: <strong>{order.paymentMethod}</strong> ({order.paymentStatus})
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Addresses & Logistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" /> Pickup Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-slate-900">
              {order.pickupAddress?.recipientName} (+91 {order.pickupAddress?.mobile})
            </p>
            <p className="text-slate-600 mt-1">
              {order.pickupAddress?.addressLine}, {order.pickupAddress?.locality}
            </p>
            <p className="text-slate-400 mt-0.5">
              {order.pickupAddress?.city} - {order.pickupAddress?.pincode}
            </p>
            <p className="text-primary font-medium mt-2">
              Slot: {order.pickupSlot?.label} (Date: {new Date(order.pickupDate).toLocaleDateString()})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivery Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold text-slate-900">
              {order.deliveryAddress?.recipientName} (+91 {order.deliveryAddress?.mobile})
            </p>
            <p className="text-slate-600 mt-1">
              {order.deliveryAddress?.addressLine}, {order.deliveryAddress?.locality}
            </p>
            <p className="text-slate-400 mt-0.5">
              {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}
            </p>
            <p className="text-emerald-700 font-medium mt-2">
              Slot: {order.deliverySlot?.label} (Date: {new Date(order.deliveryDate).toLocaleDateString()})
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
