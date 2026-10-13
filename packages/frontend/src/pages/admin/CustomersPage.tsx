import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useFetch } from '../../hooks/useApi';
import { Users, Search, ShoppingBag, Phone, Mail } from 'lucide-react';

export function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const queryUrl = `/admin/customers?page=${page}&limit=10${
    searchTerm ? `&search=${searchTerm}` : ''
  }`;
  const { data, isLoading } = useFetch<any>(['adminCustomers', page, searchTerm], queryUrl);

  const customers = data?.customers || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Directory"
        description="View customer profiles, contact numbers, order histories, and saved addresses"
      />

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by customer name or mobile number (e.g. 9000000003)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner className="w-8 h-8 text-primary" />
            </div>
          ) : customers.length === 0 ? (
            <EmptyState
              icon={<Users className="w-8 h-8" />}
              title="No customers found"
              description="No registered customer profiles matched your query."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Addresses Saved</th>
                    <th className="py-3 px-4 text-center">Total Bookings</th>
                    <th className="py-3 px-4">Joined On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {c.firstName} {c.lastName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>+91 {c.user?.mobile}</span>
                        </div>
                        {c.user?.email && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                            <Mail className="w-3 h-3" />
                            <span>{c.user.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {c.addresses?.length ? (
                          <span className="truncate max-w-[200px] block">
                            {c.addresses[0].locality}, {c.addresses[0].pincode}
                            {c.addresses.length > 1 && ` (+${c.addresses.length - 1} more)`}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None saved</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-primary">
                        {c._count?.orders ?? c.orders?.length ?? 0}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString()}
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
