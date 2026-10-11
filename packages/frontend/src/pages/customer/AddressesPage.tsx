import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/ui/EmptyState';
import { MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface MockAddress {
  id: string;
  recipientName: string;
  mobile: string;
  addressLine: string;
  locality: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export function AddressesPage() {
  const [addresses, setAddresses] = useState<MockAddress[]>([
    {
      id: '1',
      recipientName: 'Radha Sharma',
      mobile: '9876543210',
      addressLine: 'Flat 204, Krishna Enclave, Raman Reti',
      locality: 'Raman Reti',
      landmark: 'Near ISKCON Temple',
      city: 'Vrindavan',
      state: 'Uttar Pradesh',
      pincode: '281121',
      isDefault: true,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAddr, setNewAddr] = useState({
    recipientName: '',
    mobile: '',
    addressLine: '',
    locality: '',
    landmark: '',
    pincode: '281121',
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const created: MockAddress = {
      id: Date.now().toString(),
      recipientName: newAddr.recipientName,
      mobile: newAddr.mobile,
      addressLine: newAddr.addressLine,
      locality: newAddr.locality,
      landmark: newAddr.landmark,
      city: 'Vrindavan',
      state: 'Uttar Pradesh',
      pincode: newAddr.pincode,
      isDefault: addresses.length === 0,
    };
    setAddresses([...addresses, created]);
    setIsModalOpen(false);
    toast.success('Address added successfully');
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
    toast.success('Address removed');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader title="Saved Addresses" description="Manage delivery and pickup locations">
        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Add New Address
        </Button>
      </PageHeader>

      {addresses.length === 0 ? (
        <EmptyState
          icon={<MapPin className="w-8 h-8" />}
          title="No addresses saved yet"
          description="Add your home or office address to quickly schedule dry cleaning pickups."
          actionLabel="Add Address"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <Card key={addr.id} className="relative border-slate-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-slate-900">{addr.recipientName}</h4>
                  {addr.isDefault && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mb-2">Phone: +91 {addr.mobile}</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {addr.addressLine}, {addr.locality}
                  {addr.landmark ? `, Near ${addr.landmark}` : ''}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(addr.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Address">
        <form onSubmit={handleAdd} className="space-y-4">
          <Input
            label="Recipient Name"
            required
            value={newAddr.recipientName}
            onChange={(e) => setNewAddr({ ...newAddr, recipientName: e.target.value })}
          />
          <Input
            label="Contact Mobile"
            required
            maxLength={10}
            value={newAddr.mobile}
            onChange={(e) => setNewAddr({ ...newAddr, mobile: e.target.value })}
          />
          <Input
            label="House / Flat / Street"
            required
            value={newAddr.addressLine}
            onChange={(e) => setNewAddr({ ...newAddr, addressLine: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Locality"
              required
              value={newAddr.locality}
              onChange={(e) => setNewAddr({ ...newAddr, locality: e.target.value })}
            />
            <Input
              label="Landmark (Optional)"
              value={newAddr.landmark}
              onChange={(e) => setNewAddr({ ...newAddr, landmark: e.target.value })}
            />
          </div>
          <Input
            label="Pincode"
            required
            maxLength={6}
            value={newAddr.pincode}
            onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
          />
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
