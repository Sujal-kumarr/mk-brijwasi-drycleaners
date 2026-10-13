import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { useFetch, useMutate } from '../../hooks/useApi';
import { api } from '../../lib/api';
import { MapPin, Plus, Trash2, CheckCircle2, Edit2, ShieldCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export interface AddressItem {
  id: string;
  recipientName: string;
  mobile: string;
  addressLine: string;
  locality: string;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export function AddressesPage() {
  const { data: addresses, isLoading } = useFetch<AddressItem[]>(['userAddresses'], '/addresses');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);
  const [serviceabilityStatus, setServiceabilityStatus] = useState<{
    checked: boolean;
    serviceable: boolean;
    message?: string;
  }>({ checked: false, serviceable: true });

  const [formValues, setFormValues] = useState({
    recipientName: '',
    mobile: '',
    addressLine: '',
    locality: '',
    landmark: '',
    city: 'Vrindavan',
    state: 'Uttar Pradesh',
    pincode: '281121',
    isDefault: false,
  });

  const checkPincode = async (pincode: string) => {
    if (pincode.length !== 6) return;
    try {
      const res = await api.get(`/addresses/serviceability?pincode=${pincode}`);
      const serviceable = res.data.data.serviceable;
      setServiceabilityStatus({
        checked: true,
        serviceable,
        message: serviceable
          ? `We deliver to ${res.data.data.area?.name || 'this location'}!`
          : 'Sorry, we currently only service Vrindavan, Mathura & Govardhan.',
      });
    } catch {
      setServiceabilityStatus({ checked: false, serviceable: true });
    }
  };

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormValues({
      recipientName: '',
      mobile: '',
      addressLine: '',
      locality: '',
      landmark: '',
      city: 'Vrindavan',
      state: 'Uttar Pradesh',
      pincode: '281121',
      isDefault: !addresses || addresses.length === 0,
    });
    setServiceabilityStatus({ checked: false, serviceable: true });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (addr: AddressItem) => {
    setEditingAddress(addr);
    setFormValues({
      recipientName: addr.recipientName,
      mobile: addr.mobile,
      addressLine: addr.addressLine,
      locality: addr.locality,
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setServiceabilityStatus({ checked: false, serviceable: true });
    setIsModalOpen(true);
  };

  const saveMutation = useMutate(
    async (values: typeof formValues) => {
      if (editingAddress) {
        const res = await api.put(`/addresses/${editingAddress.id}`, values);
        return res.data;
      } else {
        const res = await api.post('/addresses', values);
        return res.data;
      }
    },
    [['userAddresses']]
  );

  const deleteMutation = useMutate(
    async (id: string) => {
      const res = await api.delete(`/addresses/${id}`);
      return res.data;
    },
    [['userAddresses']]
  );

  const setDefaultMutation = useMutate(
    async (id: string) => {
      const res = await api.patch(`/addresses/${id}/default`);
      return res.data;
    },
    [['userAddresses']]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceabilityStatus.serviceable) {
      toast.error('Cannot save address in unserviceable pincode');
      return;
    }
    saveMutation.mutate(formValues, {
      onSuccess: () => {
        toast.success(editingAddress ? 'Address updated' : 'Address added successfully');
        setIsModalOpen(false);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.error || 'Failed to save address');
      },
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success('Address removed'),
        onError: () => toast.error('Failed to remove address'),
      });
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultMutation.mutate(id, {
      onSuccess: () => toast.success('Default address updated'),
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader title="Saved Addresses" description="Manage delivery and pickup locations in Vrindavan & Mathura">
        <Button variant="primary" size="sm" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4 mr-1" /> Add New Address
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      ) : !addresses || addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="w-8 h-8" />}
          title="No addresses saved yet"
          description="Add your home, ashram, or hotel address in Vrindavan/Mathura to schedule door-to-door dry cleaning pickups."
          actionLabel="Add Address"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <Card key={addr.id} className="relative border-slate-200 hover:shadow-md transition">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-slate-900">{addr.recipientName}</h4>
                  {addr.isDefault ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Default Address
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs text-slate-400 hover:text-primary underline"
                    >
                      Make Default
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-2">Phone: +91 {addr.mobile}</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {addr.addressLine}, {addr.locality}
                  {addr.landmark ? `, Landmark: ${addr.landmark}` : ''}
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(addr)} className="text-slate-600">
                    <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(addr.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Recipient Full Name"
            required
            value={formValues.recipientName}
            onChange={(e) => setFormValues({ ...formValues, recipientName: e.target.value })}
            placeholder="e.g. Radha Sharma"
          />
          <Input
            label="Mobile Number (10 digits)"
            required
            maxLength={10}
            value={formValues.mobile}
            onChange={(e) => setFormValues({ ...formValues, mobile: e.target.value })}
            placeholder="e.g. 9876543210"
          />
          <Input
            label="Flat / House / Building / Street"
            required
            value={formValues.addressLine}
            onChange={(e) => setFormValues({ ...formValues, addressLine: e.target.value })}
            placeholder="e.g. Flat 301, Sri Krishna Residency"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Locality / Area"
              required
              value={formValues.locality}
              onChange={(e) => setFormValues({ ...formValues, locality: e.target.value })}
              placeholder="e.g. Raman Reti"
            />
            <Input
              label="Landmark (Optional)"
              value={formValues.landmark}
              onChange={(e) => setFormValues({ ...formValues, landmark: e.target.value })}
              placeholder="e.g. Near ISKCON"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="City"
              value={formValues.city}
              onChange={(e) => setFormValues({ ...formValues, city: e.target.value })}
            />
            <Input
              label="State"
              value={formValues.state}
              onChange={(e) => setFormValues({ ...formValues, state: e.target.value })}
            />
            <div>
              <Input
                label="Pincode"
                required
                maxLength={6}
                value={formValues.pincode}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormValues({ ...formValues, pincode: val });
                  if (val.length === 6) checkPincode(val);
                }}
                placeholder="281121"
              />
            </div>
          </div>

          {serviceabilityStatus.checked && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                serviceabilityStatus.serviceable
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {serviceabilityStatus.serviceable ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{serviceabilityStatus.message}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDefault"
              checked={formValues.isDefault}
              onChange={(e) => setFormValues({ ...formValues, isDefault: e.target.checked })}
              className="rounded text-primary border-slate-300"
            />
            <label htmlFor="isDefault" className="text-xs text-slate-700">
              Set as my default pickup & delivery address
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={saveMutation.isPending}
              disabled={!serviceabilityStatus.serviceable}
            >
              {editingAddress ? 'Save Changes' : 'Save Address'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
