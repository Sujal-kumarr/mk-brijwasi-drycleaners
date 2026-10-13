import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useFetch } from '../../hooks/useApi';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Layers,
  ArrowRight,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const { data: stats, isLoading: loadingStats } = useFetch<any>(
    ['adminDashboardMetrics'],
    '/admin/dashboard'
  );
  const { data: recentOrdersData, isLoading: loadingOrders } = useFetch<any>(
    ['adminRecentOrders'],
    '/admin/orders?limit=6'
  );

  const metrics = [
    {
      title: 'Orders Today',
      value: stats?.ordersToday ?? 0,
      icon: ShoppingBag,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Pending Confirmation',
      value: stats?.pendingConfirmation ?? 0,
      icon: AlertCircle,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      title: 'Pickups Pending',
      value: stats?.pickupsPending ?? 0,
      icon: Truck,
      color: 'text-orange-600 bg-orange-50',
    },
    {
      title: 'In Processing',
      value: stats?.inProcessing ?? 0,
      icon: Clock,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      title: 'Ready for Delivery',
      value: stats?.readyForDelivery ?? 0,
      icon: Layers,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      title: 'Completed Orders',
      value: stats?.completed ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Gross Sales',
      value: `₹${((stats?.grossSalesInPaise ?? 0) / 100).toFixed(2)}`,
      icon: IndianRupee,
      color: 'text-green-600 bg-green-50',
    },
    {
      title: 'Outstanding Dues',
      value: `₹${((stats?.outstandingPaymentsInPaise ?? 0) / 100).toFixed(2)}`,
      icon: IndianRupee,
      color: 'text-rose-600 bg-rose-50',
    },
  ];

  const recentOrders = recentOrdersData?.orders || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <PageHeader
          title="Operations Dashboard"
          description="Live overview of orders, plant processing, and logistics in Vrindavan"
        />
        <div className="flex gap-2">
          <Link to="/admin/orders">
            <Button variant="primary" size="sm">
              <ShoppingBag className="w-4 h-4 mr-1.5" /> Order Operations
            </Button>
          </Link>
          <Link to="/admin/reports">
            <Button variant="outline" size="sm">
              <TrendingUp className="w-4 h-4 mr-1.5" /> Revenue Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {loadingStats ? (
        <div className="flex justify-center py-10">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="border-slate-200 shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-2xl ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Real-time Recent Orders Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" /> Live Orders Stream
          </CardTitle>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-primary hover:underline flex items-center"
          >
            Manage All Orders <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </CardHeader>
        <CardContent>
          {loadingOrders ? (
            <div className="flex justify-center py-12">
              <Spinner className="w-6 h-6 text-primary" />
            </div>
          ) : recentOrders.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="w-8 h-8" />}
              title="Awaiting Incoming Bookings"
              description="New orders placed by customers across Vrindavan, Mathura & Govardhan will appear here live."
            />
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Locality</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{ord.orderNumber}</td>
                      <td className="py-3 px-4 text-slate-700">
                        {ord.customer?.firstName} {ord.customer?.lastName}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {ord.pickupAddress?.locality || 'Vrindavan'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={ord.status} />
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₹
                        {(
                          (ord.finalAmountInPaise ?? ord.estimatedAmountInPaise) /
                          100
                        ).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link to={`/admin/orders?search=${ord.orderNumber}`}>
                          <Button variant="ghost" size="sm" className="text-primary font-bold">
                            Open
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminPlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        <CardContent className="py-12">
          <EmptyState
            title={`${title} Module`}
            description={`Full management interface for ${title.toLowerCase()} is ready.`}
          />
        </CardContent>
      </Card>
    </div>
  );
}
