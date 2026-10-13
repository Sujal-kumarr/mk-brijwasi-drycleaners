import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { useFetch, useMutate } from '../../hooks/useApi';
import { api } from '../../lib/api';
import { Settings, MapPin, Clock, Plus, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const { data: config, isLoading: loadingConfig, refetch: refetchConfig } = useFetch<any>(
    ['businessConfig'],
    '/admin/config'
  );
  const { data: areas, isLoading: loadingAreas, refetch: refetchAreas } = useFetch<any[]>(
    ['serviceAreas'],
    '/admin/service-areas'
  );
  const { data: slots, isLoading: loadingSlots, refetch: refetchSlots } = useFetch<any[]>(
    ['timeSlots'],
    '/admin/time-slots'
  );

  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [areaForm, setAreaForm] = useState({ name: '', pincode: '' });

  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({
    label: '',
    startHour: 9,
    endHour: 12,
    slotType: 'PICKUP',
  });

  const [configForm, setConfigForm] = useState<any>(null);

  React.useEffect(() => {
    if (config) {
      setConfigForm({
        businessName: config.businessName,
        contactPhone: config.contactPhone,
        contactEmail: config.contactEmail,
        address: config.address,
        minOrderInRupees: (config.minOrderAmountInPaise / 100).toString(),
        deliveryFeeInRupees: (config.deliveryFeeInPaise / 100).toString(),
        cancellationPolicyHours: config.cancellationPolicyHours,
      });
    }
  }, [config]);

  // Mutations
  const configMutation = useMutate(
    async (values: any) => {
      return (
        await api.put('/admin/config', {
          businessName: values.businessName,
          contactPhone: values.contactPhone,
          contactEmail: values.contactEmail,
          address: values.address,
          minOrderAmountInPaise: Math.round(parseFloat(values.minOrderInRupees) * 100),
          deliveryFeeInPaise: Math.round(parseFloat(values.deliveryFeeInRupees) * 100),
          cancellationPolicyHours: Number(values.cancellationPolicyHours),
        })
      ).data;
    },
    [['businessConfig']]
  );

  const areaMutation = useMutate(
    async (values: any) => {
      return (await api.post('/admin/service-areas', values)).data;
    },
    [['serviceAreas']]
  );

  const slotMutation = useMutate(
    async (values: any) => {
      return (await api.post('/admin/time-slots', values)).data;
    },
    [['timeSlots']]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Configuration & Service Zones"
        description="Brand identity, doorstep delivery fee, serviced pin codes, and daily delivery slots"
      />

      {loadingConfig || !configForm ? (
        <div className="flex justify-center py-12">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" /> Core Business Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                configMutation.mutate(configForm, {
                  onSuccess: () => toast.success('Business settings updated'),
                  onError: () => toast.error('Failed to update settings'),
                });
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Business Name"
                  required
                  value={configForm.businessName}
                  onChange={(e) => setConfigForm({ ...configForm, businessName: e.target.value })}
                />
                <Input
                  label="Customer Support Mobile"
                  required
                  value={configForm.contactPhone}
                  onChange={(e) => setConfigForm({ ...configForm, contactPhone: e.target.value })}
                />
                <Input
                  label="Contact Email"
                  type="email"
                  required
                  value={configForm.contactEmail}
                  onChange={(e) => setConfigForm({ ...configForm, contactEmail: e.target.value })}
                />
                <Input
                  label="Plant / Main Shop Address"
                  required
                  value={configForm.address}
                  onChange={(e) => setConfigForm({ ...configForm, address: e.target.value })}
                />
                <Input
                  label="Minimum Order Value in INR (₹)"
                  type="number"
                  required
                  value={configForm.minOrderInRupees}
                  onChange={(e) => setConfigForm({ ...configForm, minOrderInRupees: e.target.value })}
                />
                <Input
                  label="Doorstep Delivery Fee in INR (₹)"
                  type="number"
                  required
                  value={configForm.deliveryFeeInRupees}
                  onChange={(e) => setConfigForm({ ...configForm, deliveryFeeInRupees: e.target.value })}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="primary" type="submit" isLoading={configMutation.isPending}>
                  <Save className="w-4 h-4 mr-1.5" /> Save Configuration
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Service Areas & Pincodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" /> Supported Localities & Pincodes
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setIsAreaModalOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Zone
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {areas?.map((a) => (
              <div
                key={a.id}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center"
              >
                <div>
                  <span className="font-bold text-slate-800">{a.name}</span>
                  <span className="text-slate-500 ml-2">Pincode: {a.pincode}</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Operating Time Slots */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" /> Daily Pickup & Delivery Windows
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setIsSlotModalOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Window
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {slots?.map((s) => (
              <div
                key={s.id}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center"
              >
                <div>
                  <span className="font-bold text-slate-800">{s.label}</span>
                  <span className="text-slate-400 ml-2 text-[11px]">
                    ({s.startHour}:00 - {s.endHour}:00)
                  </span>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                  {s.slotType}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Add Zone Modal */}
      <Modal
        isOpen={isAreaModalOpen}
        onClose={() => setIsAreaModalOpen(false)}
        title="Add Service Area Zone"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            areaMutation.mutate(areaForm, {
              onSuccess: () => {
                toast.success('Service area added');
                setIsAreaModalOpen(false);
              },
            });
          }}
          className="space-y-3 text-xs"
        >
          <Input
            label="Area / Locality Name"
            required
            value={areaForm.name}
            onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
            placeholder="e.g. Raman Reti, Vrindavan"
          />
          <Input
            label="Pincode (6 digits)"
            required
            maxLength={6}
            value={areaForm.pincode}
            onChange={(e) => setAreaForm({ ...areaForm, pincode: e.target.value })}
            placeholder="281121"
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsAreaModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={areaMutation.isPending}>
              Save Zone
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Slot Modal */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        title="Add Time Window"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            slotMutation.mutate(
              {
                ...slotForm,
                startHour: Number(slotForm.startHour),
                endHour: Number(slotForm.endHour),
              },
              {
                onSuccess: () => {
                  toast.success('Time slot added');
                  setIsSlotModalOpen(false);
                },
              }
            );
          }}
          className="space-y-3 text-xs"
        >
          <Input
            label="Label (e.g. 9am - 12pm)"
            required
            value={slotForm.label}
            onChange={(e) => setSlotForm({ ...slotForm, label: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Hour (0-23)"
              type="number"
              required
              value={slotForm.startHour}
              onChange={(e) => setSlotForm({ ...slotForm, startHour: parseInt(e.target.value) })}
            />
            <Input
              label="End Hour (1-24)"
              type="number"
              required
              value={slotForm.endHour}
              onChange={(e) => setSlotForm({ ...slotForm, endHour: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Window Type</label>
            <select
              value={slotForm.slotType}
              onChange={(e) => setSlotForm({ ...slotForm, slotType: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
            >
              <option value="PICKUP">Pickup Window</option>
              <option value="DELIVERY">Delivery Window</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsSlotModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={slotMutation.isPending}>
              Save Window
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
