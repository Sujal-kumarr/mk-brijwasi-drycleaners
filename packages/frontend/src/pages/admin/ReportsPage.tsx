import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useFetch } from '../../hooks/useApi';
import { api } from '../../lib/api';
import {
  TrendingUp,
  Download,
  Calendar,
  Layers,
  ShoppingBag,
  DollarSign,
  FileSpreadsheet,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function ReportsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const { data: orderReport, isLoading: loadingOrders } = useFetch<any>(
    ['orderReports', period],
    `/reports/orders?period=${period}`
  );

  const { data: serviceReport, isLoading: loadingServices } = useFetch<any>(
    ['serviceReports'],
    '/reports/services'
  );

  const handleExportCsv = async () => {
    try {
      const res = await api.get('/reports/export/orders', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Orders report CSV downloaded');
    } catch (e) {
      toast.error('Failed to export CSV');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Business Analytics & Reports"
          description="Revenue trends, volume breakdown, and turnaround metrics across Vrindavan"
        />
        <Button variant="primary" size="sm" onClick={handleExportCsv}>
          <Download className="w-4 h-4 mr-1.5" /> Export Orders CSV
        </Button>
      </div>

      {/* Period Selector Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {(['daily', 'weekly', 'monthly'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
              period === p
                ? 'bg-primary text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {p} Summary
          </button>
        ))}
      </div>

      {/* Period Analytics Cards */}
      {loadingOrders ? (
        <div className="flex justify-center py-12">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-200">
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Orders ({period})
              </span>
              <span className="text-3xl font-black text-slate-900 mt-1 block">
                {orderReport?.totalOrders ?? 0}
              </span>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">
                Completed Deliveries
              </span>
              <span className="text-3xl font-black text-emerald-600 mt-1 block">
                {orderReport?.completedOrders ?? 0}
              </span>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
                Total Revenue Generated
              </span>
              <span className="text-3xl font-black text-primary mt-1 block">
                ₹{((orderReport?.totalRevenueInPaise ?? 0) / 100).toFixed(2)}
              </span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Breakdown by Service Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" /> Revenue Breakdown by Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingServices ? (
            <div className="flex justify-center py-8">
              <Spinner className="w-6 h-6 text-primary" />
            </div>
          ) : !serviceReport || serviceReport.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No service volume recorded yet.</p>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Service Type</th>
                    <th className="py-2.5 px-4 text-center">Items Processed</th>
                    <th className="py-2.5 px-4 text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {serviceReport.map((srv: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-bold text-slate-800">{srv.serviceName}</td>
                      <td className="py-2.5 px-4 text-center font-semibold text-slate-700">
                        {srv.totalQuantity}
                      </td>
                      <td className="py-2.5 px-4 text-right font-black text-primary">
                        ₹{(srv.totalRevenueInPaise / 100).toFixed(2)}
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
