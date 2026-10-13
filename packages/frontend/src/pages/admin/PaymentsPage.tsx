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
  IndianRupee,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
  FileText,
  CreditCard,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function PaymentsPage() {
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Form states
  const [recordForm, setRecordForm] = useState({
    orderId: '',
    amountInRupees: '',
    method: 'CASH_ON_DELIVERY',
    reference: '',
    notes: '',
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amountInRupees: '',
    category: 'Solvent & Detergent',
    expenseDate: new Date().toISOString().split('T')[0],
  });

  // Queries
  const { data: summary, isLoading: loadingSummary, refetch: refetchSummary } = useFetch<any>(
    ['financialSummary'],
    '/payments/summary'
  );
  const { data: expensesData, isLoading: loadingExpenses, refetch: refetchExpenses } = useFetch<any>(
    ['adminExpenses'],
    '/payments/expenses'
  );

  const expenses = expensesData?.expenses || [];

  // Mutations
  const recordMutation = useMutate(
    async (values: typeof recordForm) => {
      const paise = Math.round(parseFloat(values.amountInRupees) * 100);
      return (
        await api.post('/payments/record', {
          orderId: values.orderId,
          amountInPaise: paise,
          method: values.method,
          reference: values.reference || undefined,
          notes: values.notes || undefined,
        })
      ).data;
    },
    [['financialSummary'], ['adminOrders'], ['adminDashboardMetrics']]
  );

  const expenseMutation = useMutate(
    async (values: typeof expenseForm) => {
      const paise = Math.round(parseFloat(values.amountInRupees) * 100);
      return (
        await api.post('/payments/expenses', {
          description: values.description,
          amountInPaise: paise,
          category: values.category,
          expenseDate: values.expenseDate,
        })
      ).data;
    },
    [['financialSummary'], ['adminExpenses']]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Finance & Payments Ledger"
          description="Auditable accounting, cash collections, refunds, and laundry operating expenses"
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsExpenseModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Log Expense
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsRecordModalOpen(true)}>
            <IndianRupee className="w-4 h-4 mr-1" /> Record Payment
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      {loadingSummary ? (
        <div className="flex justify-center py-12">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200">
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Gross Sales
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                ₹{((summary?.grossSalesInPaise ?? 0) / 100).toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Completed & active orders</span>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">
                Collected Revenue
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                ₹{((summary?.collectedRevenueInPaise ?? 0) / 100).toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Verified received cash/UPI</span>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider block">
                Operating Expenses
              </span>
              <span className="text-2xl font-black text-rose-600 mt-1 block">
                ₹{((summary?.expensesInPaise ?? 0) / 100).toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Solvents, steam fuel & packaging</span>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
                Estimated Net Operating Profit
              </span>
              <span className="text-2xl font-black text-primary mt-1 block">
                ₹{((summary?.estimatedProfitInPaise ?? 0) / 100).toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">Collected less expenses & payouts</span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expenses Ledger Table */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" /> Operating Expenses Log
          </CardTitle>
          <span className="text-xs text-slate-400">Total: {expenses.length} Records</span>
        </CardHeader>
        <CardContent>
          {loadingExpenses ? (
            <div className="flex justify-center py-10">
              <Spinner className="w-6 h-6 text-primary" />
            </div>
          ) : expenses.length === 0 ? (
            <EmptyState
              icon={<Receipt className="w-8 h-8" />}
              title="No expenses logged"
              description="Record dry cleaning chemical purchases, packaging bags, steam power, or shop rent."
            />
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4">Logged By</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((exp: any) => (
                    <tr key={exp.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 text-slate-600">
                        {new Date(exp.expenseDate).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{exp.category}</td>
                      <td className="py-2.5 px-4 text-slate-700">{exp.description}</td>
                      <td className="py-2.5 px-4 text-slate-400">{exp.recordedBy?.mobile}</td>
                      <td className="py-2.5 px-4 text-right font-extrabold text-slate-900">
                        ₹{(exp.amountInPaise / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Customer Payment"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            recordMutation.mutate(recordForm, {
              onSuccess: () => {
                toast.success('Payment recorded successfully');
                setIsRecordModalOpen(false);
              },
              onError: (err: any) => {
                toast.error(err.response?.data?.error || 'Failed to record payment');
              },
            });
          }}
          className="space-y-4 text-xs"
        >
          <Input
            label="Order ID (UUID)"
            required
            value={recordForm.orderId}
            onChange={(e) => setRecordForm({ ...recordForm, orderId: e.target.value })}
            placeholder="e.g. ord-12345"
          />
          <Input
            label="Amount in INR (₹)"
            type="number"
            step="0.01"
            required
            value={recordForm.amountInRupees}
            onChange={(e) => setRecordForm({ ...recordForm, amountInRupees: e.target.value })}
            placeholder="e.g. 240.00"
          />
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
            <select
              value={recordForm.method}
              onChange={(e) => setRecordForm({ ...recordForm, method: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
            >
              <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
              <option value="PAY_ON_PICKUP">Pay on Pickup</option>
              <option value="ONLINE">Online UPI / Transfer</option>
            </select>
          </div>
          <Input
            label="Transaction Reference / UPI UTR (Optional)"
            value={recordForm.reference}
            onChange={(e) => setRecordForm({ ...recordForm, reference: e.target.value })}
            placeholder="e.g. UPI-1234567890"
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsRecordModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={recordMutation.isPending}>
              Record Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Log Expense Modal */}
      <Modal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        title="Log Laundry Plant Expense"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            expenseMutation.mutate(expenseForm, {
              onSuccess: () => {
                toast.success('Expense recorded');
                setIsExpenseModalOpen(false);
              },
              onError: (err: any) => {
                toast.error(err.response?.data?.error || 'Failed to log expense');
              },
            });
          }}
          className="space-y-4 text-xs"
        >
          <Input
            label="Expense Description"
            required
            value={expenseForm.description}
            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
            placeholder="e.g. 50L Perc dry cleaning solvent & hanger supplies"
          />
          <Input
            label="Amount in INR (₹)"
            type="number"
            step="0.01"
            required
            value={expenseForm.amountInRupees}
            onChange={(e) => setExpenseForm({ ...expenseForm, amountInRupees: e.target.value })}
            placeholder="e.g. 3500.00"
          />
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Expense Category</label>
            <select
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
            >
              <option value="Solvent & Detergent">Solvent & Detergent</option>
              <option value="Packaging & Hangers">Packaging & Hangers</option>
              <option value="Electricity & Boiler Fuel">Electricity & Boiler Fuel</option>
              <option value="Vehicle Fuel & Maintenance">Vehicle Fuel & Maintenance</option>
              <option value="Shop Rent & Utilities">Shop Rent & Utilities</option>
              <option value="Staff Wages">Staff Wages</option>
            </select>
          </div>
          <Input
            label="Expense Date"
            type="date"
            required
            value={expenseForm.expenseDate}
            onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsExpenseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={expenseMutation.isPending}>
              Save Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
