import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useFetch, useMutate } from '../../hooks/useApi';
import { api } from '../../lib/api';
import {
  ShoppingBag,
  Filter,
  CheckCircle2,
  Truck,
  Layers,
  Sparkles,
  UserCheck,
  Search,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Selected Order for Modal
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Partner Assignment state
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [assignmentType, setAssignmentType] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');

  // Inspection state
  const [inspectionItems, setInspectionItems] = useState<
    Array<{ orderItemId: string; inspectedQuantity: number; garmentName: string }>
  >([]);
  const [inspectionNote, setInspectionNote] = useState('');

  // Fetch Orders
  const queryUrl = `/admin/orders?page=${page}&limit=10${
    statusFilter ? `&status=${statusFilter}` : ''
  }${searchTerm ? `&search=${searchTerm}` : ''}`;
  const { data: ordersData, isLoading, refetch } = useFetch<any>(
    ['adminOrders', page, statusFilter, searchTerm],
    queryUrl
  );

  // Fetch Partners for Assignment
  const { data: staffData } = useFetch<any>(['adminStaffPartners'], '/admin/staff-partners');
  const partners = staffData?.partners || [];

  // Fetch Selected Order Details
  const { data: selectedOrder, isLoading: loadingSelectedOrder, refetch: refetchSelected } = useFetch<any>(
    ['adminOrderDetail', selectedOrderId],
    selectedOrderId ? `/admin/orders/${selectedOrderId}` : '',
    { enabled: !!selectedOrderId }
  );

  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination;

  // Status Update Mutation
  const statusMutation = useMutate(
    async ({ id, status, note }: { id: string; status: string; note?: string }) => {
      const res = await api.put(`/admin/orders/${id}/status`, { status, note });
      return res.data;
    },
    [['adminOrders'], ['adminOrderDetail', selectedOrderId], ['adminDashboardMetrics']]
  );

  // Partner Assignment Mutation
  const assignMutation = useMutate(
    async (payload: any) => {
      const res = await api.post(`/admin/orders/${selectedOrderId}/assign`, payload);
      return res.data;
    },
    [['adminOrders'], ['adminOrderDetail', selectedOrderId]]
  );

  // Inspection Mutation
  const inspectMutation = useMutate(
    async (payload: any) => {
      const res = await api.put(`/admin/orders/${selectedOrderId}/inspection`, payload);
      return res.data;
    },
    [['adminOrders'], ['adminOrderDetail', selectedOrderId]]
  );

  const handleOpenDetail = (id: string) => {
    setSelectedOrderId(id);
    setIsDetailModalOpen(true);
  };

  const handleOpenInspection = () => {
    if (!selectedOrder) return;
    setInspectionItems(
      selectedOrder.items.map((i: any) => ({
        orderItemId: i.id,
        inspectedQuantity: i.inspectedQuantity ?? i.quantity,
        garmentName: `${i.clothingItem.name} (${i.laundryService.name})`,
      }))
    );
    setInspectionNote('');
    setIsInspectionModalOpen(true);
  };

  const handleConfirmInspection = () => {
    inspectMutation.mutate(
      {
        items: inspectionItems.map((i) => ({
          orderItemId: i.orderItemId,
          inspectedQuantity: Number(i.inspectedQuantity),
        })),
        note: inspectionNote || 'Garments counted and inspected at laundry plant',
      },
      {
        onSuccess: () => {
          toast.success('Inspection recorded successfully');
          setIsInspectionModalOpen(false);
          refetchSelected();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.error || 'Failed to record inspection');
        },
      }
    );
  };

  const handleAssignPartner = () => {
    if (!selectedPartnerId) {
      toast.error('Please select a delivery partner');
      return;
    }
    assignMutation.mutate(
      {
        partnerId: selectedPartnerId,
        assignmentType,
        notes: `Assigned for ${assignmentType} run in Vrindavan`,
      },
      {
        onSuccess: () => {
          toast.success(`Partner assigned for ${assignmentType}`);
          setIsAssignModalOpen(false);
          refetchSelected();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.error || 'Failed to assign partner');
        },
      }
    );
  };

  const handleQuickStatusChange = (id: string, newStatus: string) => {
    statusMutation.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => toast.success(`Order marked as ${newStatus}`),
        onError: (err: any) => toast.error(err.response?.data?.error || 'Transition failed'),
      }
    );
  };

  const statusOptions = [
    'PENDING_CONFIRMATION',
    'CONFIRMED',
    'PICKUP_ASSIGNED',
    'PICKED_UP',
    'RECEIVED_AT_LAUNDRY',
    'INSPECTION_REQUIRED',
    'AWAITING_CUSTOMER_APPROVAL',
    'PROCESSING',
    'QUALITY_CHECK',
    'READY_FOR_DELIVERY',
    'DELIVERY_ASSIGNED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order Operations & Plant Workflow"
        description="Filter orders, dispatch riders, inspect garments, and update laundry progress"
      />

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Order # (e.g. MK-20261013) or Customer Mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded-lg py-2 px-3 text-xs bg-white"
            >
              <option value="">All Statuses</option>
              {statusOptions.map((st) => (
                <option key={st} value={st}>
                  {st.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner className="w-8 h-8 text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="w-8 h-8" />}
              title="No matching orders"
              description="No orders found matching the selected status or query."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Pickup Date/Slot</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {ord.customer?.firstName} {ord.customer?.lastName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {ord.customer?.user?.mobile}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(ord.pickupDate).toLocaleDateString()}
                        <span className="block text-[11px] text-slate-400">
                          {ord.pickupSlot?.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={ord.status} />
                        {ord.customerApprovalRequired && (
                          <span className="block text-[10px] text-amber-700 font-bold mt-1">
                            Pending Price Approval
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₹
                        {(
                          (ord.finalAmountInPaise ?? ord.estimatedAmountInPaise) /
                          100
                        ).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(ord.id)}
                          className="text-primary font-bold"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> View
                        </Button>
                        {ord.status === 'PENDING_CONFIRMATION' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleQuickStatusChange(ord.id, 'CONFIRMED')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-[11px]"
                          >
                            Confirm
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-slate-100 text-xs">
              <span className="text-slate-500">
                Showing {orders.length} of {pagination.total} orders
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Order Details: ${selectedOrder?.orderNumber || ''}`}
      >
        {loadingSelectedOrder || !selectedOrder ? (
          <div className="flex justify-center py-12">
            <Spinner className="w-8 h-8 text-primary" />
          </div>
        ) : (
          <div className="space-y-5 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* Header Status Bar */}
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">CURRENT STATE</span>
                <Badge status={selectedOrder.status} />
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">PAYMENT</span>
                <span className="font-bold text-slate-800">
                  {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">TOTAL</span>
                <span className="font-black text-primary text-sm">
                  ₹
                  {(
                    (selectedOrder.finalAmountInPaise ??
                      selectedOrder.estimatedAmountInPaise) /
                    100
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Quick Action Operations Buttons */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAssignmentType('PICKUP');
                  setIsAssignModalOpen(true);
                }}
              >
                <Truck className="w-3.5 h-3.5 mr-1" /> Assign Pickup Partner
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAssignmentType('DELIVERY');
                  setIsAssignModalOpen(true);
                }}
              >
                <Truck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Assign Delivery Partner
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={handleOpenInspection}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Laundry Inspection (Count & Price)
              </Button>
            </div>

            {/* Change Status Dropdown */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <label className="block text-slate-700 font-bold mb-1.5">
                Advance Order State Machine:
              </label>
              <div className="flex gap-2">
                <select
                  id="targetStatusSelect"
                  defaultValue={selectedOrder.status}
                  className="flex-1 p-2 rounded-md border border-slate-300 bg-white"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const sel = (document.getElementById('targetStatusSelect') as HTMLSelectElement)
                      ?.value;
                    if (sel) handleQuickStatusChange(selectedOrder.id, sel);
                  }}
                >
                  Update State
                </Button>
              </div>
            </div>

            {/* Garments Table */}
            <div>
              <h4 className="font-bold text-slate-800 mb-2">Garments & Services Breakdown:</h4>
              <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Item</th>
                    <th className="py-2 px-3">Service</th>
                    <th className="py-2 px-3 text-center">Initial</th>
                    <th className="py-2 px-3 text-center">Inspected</th>
                    <th className="py-2 px-3 text-right">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedOrder.items?.map((it: any) => (
                    <tr key={it.id}>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {it.clothingItem?.name}
                      </td>
                      <td className="py-2 px-3 text-slate-600">{it.laundryService?.name}</td>
                      <td className="py-2 px-3 text-center">{it.quantity}</td>
                      <td className="py-2 px-3 text-center font-bold text-primary">
                        {it.inspectedQuantity ?? it.quantity}
                      </td>
                      <td className="py-2 px-3 text-right">
                        ₹{(it.unitPriceInPaise / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Customer & Addresses */}
            <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Customer Info:</span>
                <p>
                  {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}
                </p>
                <p>Mobile: +91 {selectedOrder.customer?.user?.mobile}</p>
                {selectedOrder.specialInstructions && (
                  <p className="mt-1 text-primary font-medium">
                    Notes: {selectedOrder.specialInstructions}
                  </p>
                )}
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Pickup Address:</span>
                <p>
                  {selectedOrder.pickupAddress?.addressLine}, {selectedOrder.pickupAddress?.locality}
                </p>
                <p>
                  {selectedOrder.pickupAddress?.city} - {selectedOrder.pickupAddress?.pincode}
                </p>
                <p className="font-semibold text-slate-700 mt-1">
                  Slot: {selectedOrder.pickupSlot?.label}
                </p>
              </div>
            </div>

            {/* Assignments list */}
            {selectedOrder.assignments && selectedOrder.assignments.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 mb-1">Rider Assignments:</h4>
                <div className="space-y-1.5">
                  {selectedOrder.assignments.map((as: any) => (
                    <div
                      key={as.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">
                          {as.type}: {as.partner?.firstName} {as.partner?.lastName} (
                          {as.partner?.vehicleNumber})
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Assigned: {new Date(as.assignedAt).toLocaleString()}
                        </span>
                      </div>
                      <Badge variant={as.status === 'COMPLETED' ? 'success' : 'info'}>
                        {as.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Assign Partner Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Rider for ${assignmentType}`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Select Delivery Partner / Rider:
            </label>
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="">-- Choose Partner --</option>
              {partners.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} — {p.vehicleNumber} (
                  {p.isAvailable ? 'Available' : 'Busy'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={assignMutation.isPending}
              onClick={handleAssignPartner}
            >
              Assign Rider
            </Button>
          </div>
        </div>
      </Modal>

      {/* Laundry Inspection Modal */}
      <Modal
        isOpen={isInspectionModalOpen}
        onClose={() => setIsInspectionModalOpen(false)}
        title="Record Garment Inspection at Laundry Plant"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-500">
            Count garments received. If counts or rates differ from the customer's initial estimate,
            the order will prompt for customer price approval before continuing.
          </p>

          <div className="space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50">
            {inspectionItems.map((it, idx) => (
              <div key={it.orderItemId} className="flex justify-between items-center py-1">
                <span className="font-semibold text-slate-800">{it.garmentName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">Inspected Count:</span>
                  <input
                    type="number"
                    min="0"
                    value={it.inspectedQuantity}
                    onChange={(e) => {
                      const next = [...inspectionItems];
                      next[idx].inspectedQuantity = parseInt(e.target.value) || 0;
                      setInspectionItems(next);
                    }}
                    className="w-16 p-1 text-center font-bold border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Inspection Notes / Stain Finding:
            </label>
            <textarea
              rows={2}
              value={inspectionNote}
              onChange={(e) => setInspectionNote(e.target.value)}
              placeholder="e.g. Found turmeric stain on kurta, counted 3 shirts instead of 2"
              className="w-full border border-slate-300 rounded p-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsInspectionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={inspectMutation.isPending}
              onClick={handleConfirmInspection}
            >
              Save Inspection & Recalculate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
