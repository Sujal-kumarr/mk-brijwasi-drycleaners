import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Truck, CheckCircle2, Clock, MapPin, Power } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export function PartnerDashboard() {
  const { user } = useAuthStore();
  const [isAvailable, setIsAvailable] = useState(true);

  return (
    <div className="space-y-6">
      <div className="bg-primary text-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Hello, {user?.firstName || 'Partner'}!</h2>
          <p className="text-xs text-slate-300">Ready for today's pickup & deliveries</p>
        </div>
        <Button
          size="sm"
          variant={isAvailable ? 'secondary' : 'outline'}
          onClick={() => setIsAvailable(!isAvailable)}
          className="text-xs font-semibold"
        >
          <Power className="w-3.5 h-3.5 mr-1.5" />
          {isAvailable ? 'Online (Accepting)' : 'Offline'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <span className="text-xs text-slate-500 block">Today's Pickups</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">4</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <span className="text-xs text-slate-500 block">Deliveries</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">2</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Active Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<Truck className="w-8 h-8" />}
            title="No pending tasks right now"
            description="When an order is assigned in your service zone (Vrindavan / Mathura), it will appear here."
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function PartnerJobsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Assigned Jobs" description="Active and pending pickup/delivery orders" />
      <EmptyState
        icon={<Clock className="w-8 h-8" />}
        title="All clear!"
        description="No active tasks currently assigned."
      />
    </div>
  );
}

export function PartnerHistoryPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Job History" description="Completed runs and deliveries" />
      <EmptyState
        icon={<CheckCircle2 className="w-8 h-8" />}
        title="No historical jobs yet"
        description="Your completed assignments will appear here."
      />
    </div>
  );
}

export function PartnerEarningsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="My Earnings" description="Per-delivery commission and payouts" />
      <Card>
        <CardContent className="p-6 text-center">
          <span className="text-xs text-slate-500 block">Total Unpaid Balance</span>
          <span className="text-3xl font-extrabold text-emerald-600 mt-1 block">₹0.00</span>
          <p className="text-xs text-slate-400 mt-2">Payouts are settled directly every Monday</p>
        </CardContent>
      </Card>
    </div>
  );
}
