import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useFetch, useMutate } from '../../hooks/useApi';
import { api } from '../../lib/api';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Power,
  Phone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  IndianRupee,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export function PartnerDashboard() {
  const { user } = useAuthStore();
  const { data: profile, refetch: refetchProfile } = useFetch<any>(
    ['partnerProfile'],
    '/partners/profile'
  );
  const { data: jobsData, isLoading: loadingJobs, refetch: refetchJobs } = useFetch<any>(
    ['partnerJobs'],
    '/partners/jobs'
  );
  const { data: earningsData } = useFetch<any>(
    ['partnerEarningsSummary'],
    '/partners/earnings/summary'
  );

  const availabilityMutation = useMutate(
    async (isAvailable: boolean) => {
      const res = await api.patch('/partners/availability', { isAvailable });
      return res.data;
    },
    [['partnerProfile']]
  );

  const isAvailable = profile?.isAvailable ?? true;
  const activeJobs = jobsData?.jobs || [];

  return (
    <div className="space-y-6">
      <div className="bg-primary text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">
            Radhe Radhe, {profile?.firstName || user?.firstName || 'Partner'}!
          </h2>
          <p className="text-xs text-slate-300">
            Vehicle: <strong>{profile?.vehicleNumber || 'Unassigned'}</strong> | Zones:{' '}
            {profile?.serviceAreas?.join(', ') || 'Vrindavan'}
          </p>
        </div>
        <Button
          size="sm"
          variant={isAvailable ? 'secondary' : 'outline'}
          onClick={() =>
            availabilityMutation.mutate(!isAvailable, {
              onSuccess: () =>
                toast.success(
                  !isAvailable ? 'You are now Online (Ready for Tasks)' : 'You are now Offline'
                ),
            })
          }
          className="text-xs font-semibold"
        >
          <Power className="w-3.5 h-3.5 mr-1.5" />
          {isAvailable ? 'Online (Accepting Tasks)' : 'Offline'}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <span className="text-xs text-slate-500 block">Pending Assignments</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {activeJobs.length}
            </span>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <span className="text-xs text-slate-500 block">Completed Deliveries</span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {earningsData?.completedJobsCount ?? 0}
            </span>
          </CardContent>
        </Card>
        <Card className="border-slate-200 col-span-2 sm:col-span-1">
          <CardContent className="p-4 text-center">
            <span className="text-xs text-slate-500 block">Unpaid Commission</span>
            <span className="text-2xl font-black text-primary mt-1 block">
              ₹{((earningsData?.unpaidBalanceInPaise ?? 0) / 100).toFixed(2)}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Active Jobs Stream */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" /> Active Pickup & Delivery Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingJobs ? (
            <div className="flex justify-center py-10">
              <Spinner className="w-6 h-6 text-primary" />
            </div>
          ) : activeJobs.length === 0 ? (
            <EmptyState
              icon={<Truck className="w-8 h-8" />}
              title="All caught up!"
              description="No open pickup or delivery runs assigned at the moment."
            />
          ) : (
            <div className="space-y-3">
              {activeJobs.map((job: any) => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {job.type} RUN
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-1">
                        Order #{job.order?.orderNumber}
                      </h4>
                    </div>
                    <Badge variant={job.status === 'ASSIGNED' ? 'warning' : 'info'}>
                      {job.status}
                    </Badge>
                  </div>

                  {/* Customer details */}
                  <div className="text-xs space-y-1 text-slate-600 bg-white p-3 rounded-lg border border-slate-100">
                    <p className="font-bold text-slate-800 flex items-center justify-between">
                      <span>
                        {job.order?.customer?.firstName} {job.order?.customer?.lastName}
                      </span>
                      <a
                        href={`tel:${job.order?.customer?.user?.mobile}`}
                        className="text-primary hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call Customer
                      </a>
                    </p>
                    <p className="text-slate-500">
                      Address:{' '}
                      {job.type === 'PICKUP'
                        ? `${job.order?.pickupAddress?.addressLine}, ${job.order?.pickupAddress?.locality}`
                        : `${job.order?.deliveryAddress?.addressLine}, ${job.order?.deliveryAddress?.locality}`}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Scheduled Window:{' '}
                      {job.type === 'PICKUP'
                        ? job.order?.pickupSlot?.label
                        : job.order?.deliverySlot?.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function PartnerJobsPage() {
  const { data: jobsData, isLoading, refetch } = useFetch<any>(['partnerJobs'], '/partners/jobs');
  const [activeJobForAction, setActiveJobForAction] = useState<any>(null);
  const [proofNote, setProofNote] = useState('');

  const updateMutation = useMutate(
    async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const res = await api.put(`/partners/jobs/${id}/status`, { status, notes });
      return res.data;
    },
    [['partnerJobs'], ['partnerEarningsSummary']]
  );

  const handleUpdateStatus = (job: any, targetStatus: string) => {
    updateMutation.mutate(
      {
        id: job.id,
        status: targetStatus,
        notes: proofNote || `Completed ${job.type} by rider`,
      },
      {
        onSuccess: () => {
          toast.success(`Job marked as ${targetStatus}!`);
          setActiveJobForAction(null);
          setProofNote('');
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.error || 'Failed to update job status');
        },
      }
    );
  };

  const jobs = jobsData?.jobs || [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Assigned Tasks"
        description="Acknowledge, track, and complete door-to-door garment runs"
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-8 h-8 text-slate-400" />}
          title="No pending tasks!"
          description="When new dry cleaning pickups or deliveries are assigned to you, they will appear here."
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job: any) => (
            <Card key={job.id} className="border-slate-200">
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase">
                    {job.type}
                  </span>
                  <Badge variant={job.status === 'ASSIGNED' ? 'warning' : 'info'}>
                    {job.status}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Order #{job.order?.orderNumber}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Customer: {job.order?.customer?.firstName} {job.order?.customer?.lastName} (+91{' '}
                    {job.order?.customer?.user?.mobile})
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Location:{' '}
                    {job.type === 'PICKUP'
                      ? `${job.order?.pickupAddress?.addressLine}, ${job.order?.pickupAddress?.locality} (${job.order?.pickupAddress?.pincode})`
                      : `${job.order?.deliveryAddress?.addressLine}, ${job.order?.deliveryAddress?.locality} (${job.order?.deliveryAddress?.pincode})`}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="pt-2 flex flex-wrap gap-2 border-t border-slate-100">
                  {job.status === 'ASSIGNED' && (
                    <Button
                      size="sm"
                      variant="primary"
                      isLoading={updateMutation.isPending}
                      onClick={() => handleUpdateStatus(job, 'ACCEPTED')}
                    >
                      Acknowledge & Accept Run
                    </Button>
                  )}

                  {job.status === 'ACCEPTED' && (
                    <Button
                      size="sm"
                      variant="primary"
                      className="bg-indigo-600 hover:bg-indigo-700"
                      isLoading={updateMutation.isPending}
                      onClick={() => handleUpdateStatus(job, 'IN_PROGRESS')}
                    >
                      En Route (In Progress)
                    </Button>
                  )}

                  {job.status === 'IN_PROGRESS' && (
                    <Button
                      size="sm"
                      variant="primary"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => setActiveJobForAction(job)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Complete {job.type} Run
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Complete confirmation modal */}
      <Modal
        isOpen={!!activeJobForAction}
        onClose={() => setActiveJobForAction(null)}
        title={`Confirm ${activeJobForAction?.type} Completion`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Confirm that clothes have been safely{' '}
            {activeJobForAction?.type === 'PICKUP'
              ? 'collected from customer'
              : 'delivered back clean to customer'}
            .
          </p>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Proof Note / Customer Handover Remarks:
            </label>
            <textarea
              rows={2}
              value={proofNote}
              onChange={(e) => setProofNote(e.target.value)}
              placeholder="e.g. Handed 4 hanger garments to customer at door, payment collected"
              className="w-full border border-slate-300 rounded p-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setActiveJobForAction(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={updateMutation.isPending}
              onClick={() => handleUpdateStatus(activeJobForAction, 'COMPLETED')}
            >
              Confirm & Complete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function PartnerHistoryPage() {
  const { data: jobsData, isLoading } = useFetch<any>(['partnerJobsHistory'], '/partners/jobs');
  const jobs = jobsData?.jobs?.filter((j: any) => j.status === 'COMPLETED') || [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Completed Job History"
        description="Record of all fulfilled doorstep pickups and deliveries"
      />
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-8 h-8 text-slate-400" />}
          title="No completed runs yet"
          description="Runs you successfully complete will appear in this log."
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((j: any) => (
            <Card key={j.id} className="border-slate-200">
              <CardContent className="p-4 flex justify-between items-center text-xs">
                <div>
                  <span className="font-extrabold text-slate-900 block">
                    Order #{j.order?.orderNumber} ({j.type})
                  </span>
                  <span className="text-slate-500">
                    {j.order?.customer?.firstName} {j.order?.customer?.lastName} —{' '}
                    {j.order?.pickupAddress?.locality || 'Vrindavan'}
                  </span>
                </div>
                <div className="text-right">
                  <Badge variant="success">Completed</Badge>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {new Date(j.completedAt || j.assignedAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function PartnerEarningsPage() {
  const { data: earningsData, isLoading } = useFetch<any>(
    ['partnerEarningsSummary'],
    '/partners/earnings/summary'
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Earnings & Payouts"
        description="Per-delivery commission and weekly settlement balance"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-6 text-center">
            <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">
              Total Unpaid Commission
            </span>
            <span className="text-3xl font-black text-emerald-600 mt-2 block">
              ₹{((earningsData?.unpaidBalanceInPaise ?? 0) / 100).toFixed(2)}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Weekly automatic settlement</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6 text-center">
            <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">
              Total Lifetime Earned
            </span>
            <span className="text-3xl font-black text-primary mt-2 block">
              ₹{((earningsData?.totalEarnedInPaise ?? 0) / 100).toFixed(2)}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              From {earningsData?.completedJobsCount ?? 0} successful runs
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6 text-center">
            <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">
              Total Settled (Paid Out)
            </span>
            <span className="text-3xl font-black text-slate-800 mt-2 block">
              ₹{((earningsData?.totalPaidOutInPaise ?? 0) / 100).toFixed(2)}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Direct bank / UPI transfers</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
