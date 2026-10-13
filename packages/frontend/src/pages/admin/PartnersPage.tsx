import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useFetch, useMutate } from '../../hooks/useApi';
import { api } from '../../lib/api';
import { Truck, Plus, Phone, Power, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function PartnersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    vehicleNumber: '',
    serviceAreas: '281121, 281001',
  });

  const { data, isLoading, refetch } = useFetch<any>(['adminStaffPartners'], '/admin/staff-partners');
  const partners = data?.partners || [];

  const createMutation = useMutate(
    async (values: typeof partnerForm) => {
      const areas = values.serviceAreas.split(',').map((s) => s.trim());
      return (
        await api.post('/admin/partners', {
          firstName: values.firstName,
          lastName: values.lastName,
          mobile: values.mobile,
          vehicleNumber: values.vehicleNumber,
          serviceAreas: areas,
        })
      ).data;
    },
    [['adminStaffPartners']]
  );

  const toggleMutation = useMutate(
    async ({ id, isAvailable }: { id: string; isAvailable: boolean }) => {
      return (await api.patch(`/admin/partners/${id}/status`, { isAvailable })).data;
    },
    [['adminStaffPartners']]
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Delivery Partners & Fleet"
          description="Manage delivery partner riders, active duty status, vehicle numbers, and coverage areas"
        />
        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Onboard Rider
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner className="w-8 h-8 text-primary" />
            </div>
          ) : partners.length === 0 ? (
            <EmptyState
              icon={<Truck className="w-8 h-8" />}
              title="No delivery partners found"
              description="Onboard riders with mobile credentials and vehicle numbers to dispatch pickups and deliveries."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Partner Name</th>
                    <th className="py-3 px-4">Mobile Number</th>
                    <th className="py-3 px-4">Vehicle Number</th>
                    <th className="py-3 px-4">Coverage Zones</th>
                    <th className="py-3 px-4">Active Duty</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {partners.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {p.firstName} {p.lastName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">+91 {p.user?.mobile}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {p.vehicleNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {p.serviceAreas?.join(', ') || 'Vrindavan'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.isAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.isAvailable ? 'Online (Available)' : 'Offline'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toggleMutation.mutate({ id: p.id, isAvailable: !p.isAvailable })
                          }
                          className="text-[11px]"
                        >
                          <Power className="w-3 h-3 mr-1" />
                          {p.isAvailable ? 'Set Offline' : 'Set Online'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onboard Rider Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Onboard Delivery Partner / Rider"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(partnerForm, {
              onSuccess: () => {
                toast.success('Rider onboarded successfully');
                setIsModalOpen(false);
              },
              onError: (err: any) => {
                toast.error(err.response?.data?.error || 'Failed to onboard partner');
              },
            });
          }}
          className="space-y-3 text-xs"
        >
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name"
              required
              value={partnerForm.firstName}
              onChange={(e) => setPartnerForm({ ...partnerForm, firstName: e.target.value })}
            />
            <Input
              label="Last Name"
              required
              value={partnerForm.lastName}
              onChange={(e) => setPartnerForm({ ...partnerForm, lastName: e.target.value })}
            />
          </div>

          <Input
            label="Mobile Number (10 digits)"
            required
            maxLength={10}
            value={partnerForm.mobile}
            onChange={(e) => setPartnerForm({ ...partnerForm, mobile: e.target.value })}
            placeholder="e.g. 9000000004"
          />

          <Input
            label="Vehicle Registration (e.g. UP-85-AB-1234)"
            required
            value={partnerForm.vehicleNumber}
            onChange={(e) => setPartnerForm({ ...partnerForm, vehicleNumber: e.target.value })}
          />

          <Input
            label="Serviced Pincodes (Comma separated)"
            value={partnerForm.serviceAreas}
            onChange={(e) => setPartnerForm({ ...partnerForm, serviceAreas: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={createMutation.isPending}>
              Onboard Rider
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
