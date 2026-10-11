import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { ShoppingBag, Clock, CheckCircle2, AlertCircle, IndianRupee, Layers } from 'lucide-react';

export function AdminDashboard() {
  const stats = [
    { title: 'Orders Today', value: '18', icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
    { title: 'Pending Confirmation', value: '3', icon: AlertCircle, color: 'text-amber-600 bg-amber-50' },
    { title: 'In Progress', value: '12', icon: Clock, color: 'text-indigo-600 bg-indigo-50' },
    { title: 'Ready for Delivery', value: '5', icon: Layers, color: 'text-purple-600 bg-purple-50' },
    { title: 'Completed', value: '84', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'Gross Sales Today', value: '₹14,520', icon: IndianRupee, color: 'text-green-600 bg-green-50' },
    { title: 'Outstanding Payments', value: '₹2,100', icon: IndianRupee, color: 'text-rose-600 bg-rose-50' },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Operations Dashboard"
        description="Live overview of orders, plant processing, and logistics"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Recent Orders (Real-time)</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={<ShoppingBag className="w-8 h-8" />}
            title="Awaiting Incoming Bookings"
            description="All orders placed by customers across Vrindavan and Mathura will appear here live."
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminPlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="py-12">
          <EmptyState
            title={`${title} Management`}
            description={`Phase 1 initialized. Full configuration and records management for ${title.toLowerCase()} will be accessible here.`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
