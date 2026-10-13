import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useFetch, useMutate } from '../../hooks/useApi';
import { api } from '../../lib/api';
import {
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Shirt,
  FileText,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plus,
  Minus,
  AlertCircle,
  Truck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface TimeSlot {
  id: string;
  label: string;
  startHour: number;
  endHour: number;
  slotType: 'PICKUP' | 'DELIVERY';
}

interface Address {
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

interface ServicePrice {
  id: string;
  laundryServiceId: string;
  priceInPaise: number;
  estimatedDays: number;
  laundryService: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ClothingItem {
  id: string;
  name: string;
  description?: string;
  pricingUnit: 'PER_PIECE' | 'PER_KG';
  prices: ServicePrice[];
}

interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  items: ClothingItem[];
}

interface SelectedItem {
  clothingItemId: string;
  clothingItemName: string;
  laundryServiceId: string;
  laundryServiceName: string;
  unitPriceInPaise: number;
  quantity: number;
  notes?: string;
}

export function BookingFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Queries
  const { data: addresses, isLoading: loadingAddresses } = useFetch<Address[]>(
    ['userAddresses'],
    '/addresses'
  );
  const { data: slots, isLoading: loadingSlots } = useFetch<TimeSlot[]>(
    ['timeSlots'],
    '/admin/time-slots'
  );
  const { data: catalog, isLoading: loadingCatalog } = useFetch<CatalogCategory[]>(
    ['bookingCatalog'],
    '/catalog/booking'
  );
  const { data: businessConfig } = useFetch<any>(['businessConfig'], '/admin/config');

  // Form selections
  const [pickupAddressId, setPickupAddressId] = useState<string>('');
  const [deliveryAddressId, setDeliveryAddressId] = useState<string>('');
  const [sameAsPickup, setSameAsPickup] = useState(true);

  // Dates & Slots
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const futureDelivery = new Date();
  futureDelivery.setDate(futureDelivery.getDate() + 3);
  const defaultDeliveryStr = futureDelivery.toISOString().split('T')[0];

  const [pickupDate, setPickupDate] = useState(tomorrowStr);
  const [pickupSlotId, setPickupSlotId] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState(defaultDeliveryStr);
  const [deliverySlotId, setDeliverySlotId] = useState<string>('');

  // Selected Garments
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  // Special Instructions
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [fabricCareNotes, setFabricCareNotes] = useState('');
  const [stainNotes, setStainNotes] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'PAY_ON_PICKUP'>(
    'CASH_ON_DELIVERY'
  );

  // Completed Order
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Calculations
  const deliveryFeeInPaise = businessConfig?.deliveryFeeInPaise ?? 3000;
  const minOrderAmountInPaise = businessConfig?.minOrderAmountInPaise ?? 10000;

  const itemsTotalInPaise = selectedItems.reduce(
    (sum, item) => sum + item.unitPriceInPaise * item.quantity,
    0
  );
  const totalEstimatedInPaise = itemsTotalInPaise + deliveryFeeInPaise;

  // Filter pickup and delivery slots
  const pickupSlots = slots?.filter((s) => s.slotType === 'PICKUP') || [];
  const deliverySlots = slots?.filter((s) => s.slotType === 'DELIVERY') || [];

  // Default address auto-selection
  React.useEffect(() => {
    if (addresses && addresses.length > 0 && !pickupAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setPickupAddressId(defaultAddr.id);
      if (sameAsPickup) {
        setDeliveryAddressId(defaultAddr.id);
      }
    }
  }, [addresses, pickupAddressId, sameAsPickup]);

  React.useEffect(() => {
    if (sameAsPickup && pickupAddressId) {
      setDeliveryAddressId(pickupAddressId);
    }
  }, [sameAsPickup, pickupAddressId]);

  React.useEffect(() => {
    if (pickupSlots.length > 0 && !pickupSlotId) {
      setPickupSlotId(pickupSlots[0].id);
    }
    if (deliverySlots.length > 0 && !deliverySlotId) {
      setDeliverySlotId(deliverySlots[0].id);
    }
  }, [pickupSlots, deliverySlots, pickupSlotId, deliverySlotId]);

  React.useEffect(() => {
    if (catalog && catalog.length > 0 && !selectedCategoryTab) {
      setSelectedCategoryTab(catalog[0].id);
    }
  }, [catalog, selectedCategoryTab]);

  // Garment basket controls
  const handleItemQuantityChange = (
    item: ClothingItem,
    price: ServicePrice,
    delta: number
  ) => {
    setSelectedItems((prev) => {
      const existingIdx = prev.findIndex(
        (p) =>
          p.clothingItemId === item.id && p.laundryServiceId === price.laundryServiceId
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        const nextQty = next[existingIdx].quantity + delta;
        if (nextQty <= 0) {
          return next.filter((_, idx) => idx !== existingIdx);
        } else {
          next[existingIdx].quantity = nextQty;
          return next;
        }
      } else if (delta > 0) {
        return [
          ...prev,
          {
            clothingItemId: item.id,
            clothingItemName: item.name,
            laundryServiceId: price.laundryServiceId,
            laundryServiceName: price.laundryService.name,
            unitPriceInPaise: price.priceInPaise,
            quantity: 1,
          },
        ];
      }
      return prev;
    });
  };

  const getItemQuantity = (clothingItemId: string, laundryServiceId: string) => {
    const item = selectedItems.find(
      (p) =>
        p.clothingItemId === clothingItemId && p.laundryServiceId === laundryServiceId
    );
    return item ? item.quantity : 0;
  };

  // Submit order
  const orderMutation = useMutate(
    async () => {
      const allNotes = [
        specialInstructions.trim(),
        fabricCareNotes.trim() ? `Fabric Care: ${fabricCareNotes.trim()}` : null,
        stainNotes.trim() ? `Stains: ${stainNotes.trim()}` : null,
      ]
        .filter(Boolean)
        .join(' | ');

      const payload = {
        pickupAddressId,
        deliveryAddressId: sameAsPickup ? pickupAddressId : deliveryAddressId,
        pickupDate,
        pickupSlotId,
        deliveryDate,
        deliverySlotId,
        paymentMethod,
        specialInstructions: allNotes || undefined,
        items: selectedItems.map((item) => ({
          clothingItemId: item.clothingItemId,
          laundryServiceId: item.laundryServiceId,
          quantity: item.quantity,
          notes: item.notes,
        })),
      };

      const res = await api.post('/orders', payload);
      return res.data.data;
    },
    [['userOrders'], ['dashboardMetrics']]
  );

  const handleConfirmOrder = () => {
    orderMutation.mutate(undefined, {
      onSuccess: (data) => {
        setCreatedOrder(data);
        setCurrentStep(8);
        toast.success(`Booking confirmed! Order #${data.orderNumber}`);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.error || 'Failed to place order');
      },
    });
  };

  if (loadingAddresses || loadingCatalog || loadingSlots) {
    return (
      <div className="flex flex-col justify-center items-center py-24">
        <Spinner className="h-10 w-10 text-primary mb-3" />
        <p className="text-sm text-slate-500">Loading catalog, service zones & available slots...</p>
      </div>
    );
  }

  // Step indicator steps
  const stepsList = [
    'Addresses',
    'Schedule',
    'Catalog',
    'Care Notes',
    'Estimate',
    'Payment',
    'Confirm',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader
        title="Book Laundry & Dry Cleaning"
        description="Vrindavan door-to-door garment pickup and professional care"
      />

      {/* Step Progress Bar */}
      {currentStep < 8 && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>
              Step {currentStep} of {stepsList.length}: {stepsList[currentStep - 1]}
            </span>
            <span>Estimated Total: ₹{(totalEstimatedInPaise / 100).toFixed(2)}</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${(currentStep / stepsList.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 1: Addresses */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Step 1: Select Pickup & Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!addresses || addresses.length === 0 ? (
              <EmptyState
                icon={<MapPin className="w-8 h-8" />}
                title="No saved addresses found"
                description="Please save your Vrindavan/Mathura address first to schedule a pickup."
                actionLabel="Manage Addresses"
                onAction={() => navigate('/addresses')}
              />
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Pickup Location
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setPickupAddressId(addr.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition ${
                          pickupAddressId === addr.id
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-slate-900 text-sm">
                            {addr.recipientName}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] bg-slate-100 font-bold px-1.5 py-0.5 rounded text-slate-600">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {addr.addressLine}, {addr.locality}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {addr.city} - {addr.pincode}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={sameAsPickup}
                      onChange={(e) => setSameAsPickup(e.target.checked)}
                      className="rounded text-primary border-slate-300 focus:ring-primary"
                    />
                    Delivery address is the same as pickup address
                  </label>
                </div>

                {!sameAsPickup && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Delivery Location
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => setDeliveryAddressId(addr.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition ${
                            deliveryAddressId === addr.id
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="font-semibold text-slate-900 text-sm block">
                            {addr.recipientName}
                          </span>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                            {addr.addressLine}, {addr.locality}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-slate-100">
                  <Button variant="outline" size="sm" onClick={() => navigate('/addresses')}>
                    <Plus className="w-4 h-4 mr-1" /> Add New Address
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!pickupAddressId || (!sameAsPickup && !deliveryAddressId)}
                    onClick={() => setCurrentStep(2)}
                  >
                    Next: Schedule Times <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* STEP 2: Dates & Slots */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Step 2: Pickup & Delivery Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pickup Schedule */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" /> Doorstep Pickup Time
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Pickup Slot
                  </label>
                  <select
                    value={pickupSlotId}
                    onChange={(e) => setPickupSlotId(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-2 text-sm bg-white"
                  >
                    {pickupSlots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Delivery Schedule */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Return Delivery Time
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Delivery Date (Min 2-3 Days for Quality Processing)
                  </label>
                  <input
                    type="date"
                    min={pickupDate}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Delivery Slot
                  </label>
                  <select
                    value={deliverySlotId}
                    onChange={(e) => setDeliverySlotId(e.target.value)}
                    className="w-full rounded-md border border-slate-300 p-2 text-sm bg-white"
                  >
                    {deliverySlots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                variant="primary"
                disabled={!pickupDate || !pickupSlotId || !deliveryDate || !deliverySlotId}
                onClick={() => setCurrentStep(3)}
              >
                Next: Select Garments <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Clothing & Laundry Service Catalog */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shirt className="w-5 h-5 text-primary" /> Step 3: Browse Clothing & Services
                </CardTitle>
                <div className="text-xs bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-medium">
                  Min order: ₹{(minOrderAmountInPaise / 100).toFixed(2)} | Current Items: ₹
                  {(itemsTotalInPaise / 100).toFixed(2)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Category Navigation Tabs */}
              <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2 mb-4">
                {catalog?.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryTab(cat.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                      selectedCategoryTab === cat.id
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.name} ({cat.items.length})
                  </button>
                ))}
              </div>

              {/* Items in active category */}
              {catalog
                ?.filter((cat) => cat.id === selectedCategoryTab)
                .map((cat) => (
                  <div key={cat.id} className="space-y-4">
                    {cat.items.length === 0 ? (
                      <p className="text-xs text-slate-500 py-6 text-center">
                        No active items in this category currently.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {cat.items.map((item) => (
                          <div
                            key={item.id}
                            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-semibold">
                                  {item.pricingUnit === 'PER_PIECE' ? 'Per Piece' : 'Per Kg'}
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-xs text-slate-500 mb-3">{item.description}</p>
                              )}
                            </div>

                            {/* Service Prices Selector */}
                            <div className="space-y-2 mt-2 pt-2 border-t border-slate-100">
                              {item.prices.map((price) => {
                                const qty = getItemQuantity(item.id, price.laundryServiceId);
                                return (
                                  <div
                                    key={price.id}
                                    className="flex items-center justify-between text-xs py-1"
                                  >
                                    <div>
                                      <span className="font-semibold text-slate-800">
                                        {price.laundryService.name}
                                      </span>
                                      <span className="text-primary font-bold ml-2">
                                        ₹{(price.priceInPaise / 100).toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {qty > 0 && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleItemQuantityChange(item, price, -1)
                                            }
                                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
                                          >
                                            <Minus className="w-3 h-3" />
                                          </button>
                                          <span className="w-5 text-center font-bold text-slate-900">
                                            {qty}
                                          </span>
                                        </>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleItemQuantityChange(item, price, 1)}
                                        className="w-6 h-6 rounded bg-primary hover:bg-primary/90 text-white flex items-center justify-center font-bold shadow-sm"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

              {/* Basket drawer preview */}
              {selectedItems.length > 0 && (
                <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Current Basket ({selectedItems.reduce((acc, i) => acc + i.quantity, 0)}{' '}
                    items)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItems.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 text-xs bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-800"
                      >
                        <span className="font-semibold">{item.quantity}x</span> {item.clothingItemName} (
                        {item.laundryServiceName}) — ₹
                        {((item.unitPriceInPaise * item.quantity) / 100).toFixed(2)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6 border-t border-slate-100 mt-6">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button
                  variant="primary"
                  disabled={selectedItems.length === 0}
                  onClick={() => {
                    if (itemsTotalInPaise < minOrderAmountInPaise) {
                      toast.error(
                        `Minimum order value is ₹${(minOrderAmountInPaise / 100).toFixed(
                          2
                        )}. Please add more items.`
                      );
                      return;
                    }
                    setCurrentStep(4);
                  }}
                >
                  Next: Special Care Notes <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* STEP 4: Care Notes & Special Instructions */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Step 4: Fabric Care & Stain Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Stain Treatment Details (Optional)
              </label>
              <textarea
                rows={2}
                value={stainNotes}
                onChange={(e) => setStainNotes(e.target.value)}
                placeholder="e.g. Oil stain on kurta collar, turmeric/haldi mark on white shirt sleeve"
                className="w-full rounded-md border border-slate-300 p-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Fabric Care & Delicate Handling (Optional)
              </label>
              <textarea
                rows={2}
                value={fabricCareNotes}
                onChange={(e) => setFabricCareNotes(e.target.value)}
                placeholder="e.g. Pure raw silk saree, do not hot steam press borders; gentle hand-finish only"
                className="w-full rounded-md border border-slate-300 p-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                Pickup Instructions / Landmark Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="e.g. Call security gate on arrival; clothes kept in blue laundry bag"
                className="w-full rounded-md border border-slate-300 p-2.5 text-sm"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button variant="primary" onClick={() => setCurrentStep(5)}>
                Next: Review Estimate <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 5: Itemized Cost Estimate Review */}
      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" /> Step 5: Itemized Cost Estimate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Transparent Pricing Guarantee:</strong> This itemized calculation is an
                initial estimate. Once our inspection team counts and checks your garments at the plant,
                if any count differs or special stain care is needed, your approval will be required
                before any adjustment.
              </span>
            </div>

            {/* Itemized Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Garment</th>
                    <th className="py-2.5 px-4">Service</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Rate</th>
                    <th className="py-2.5 px-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-semibold text-slate-800">
                        {item.clothingItemName}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">{item.laundryServiceName}</td>
                      <td className="py-2.5 px-4 text-center font-bold text-slate-900">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-500">
                        ₹{(item.unitPriceInPaise / 100).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                        ₹{((item.unitPriceInPaise * item.quantity) / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Garments Subtotal:</span>
                <span className="font-semibold text-slate-800">
                  ₹{(itemsTotalInPaise / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Vrindavan Doorstep Delivery & Handling:</span>
                <span className="font-semibold text-slate-800">
                  ₹{(deliveryFeeInPaise / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Estimated Total:</span>
                <span className="text-primary text-base">
                  ₹{(totalEstimatedInPaise / 100).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setCurrentStep(4)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button variant="primary" onClick={() => setCurrentStep(6)}>
                Next: Payment Option <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 6: Payment Method */}
      {currentStep === 6 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Step 6: Choose Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-500">
              Pay conveniently upon pickup or after clean delivery. (UPI / QR code & cash accepted by
              our rider).
            </p>

            <div className="space-y-3">
              <label
                onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      Cash on Delivery (COD) / UPI on Return
                    </span>
                    <span className="text-xs text-slate-500">
                      Pay only when your freshly cleaned garments are delivered to your doorstep
                    </span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'CASH_ON_DELIVERY'}
                  onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  className="text-primary"
                />
              </label>

              <label
                onClick={() => setPaymentMethod('PAY_ON_PICKUP')}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  paymentMethod === 'PAY_ON_PICKUP'
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-accent" />
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      Pay on Pickup / Advance Settlement
                    </span>
                    <span className="text-xs text-slate-500">
                      Settle via UPI or Cash directly with our pickup rider at collection time
                    </span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'PAY_ON_PICKUP'}
                  onChange={() => setPaymentMethod('PAY_ON_PICKUP')}
                  className="text-primary"
                />
              </label>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setCurrentStep(5)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button variant="primary" onClick={() => setCurrentStep(7)}>
                Review & Confirm <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 7: Final Review & Confirm */}
      {currentStep === 7 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" /> Step 7: Confirm Booking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Pickup Schedule
                </span>
                <p className="text-slate-700">
                  Date: <strong className="text-slate-900">{pickupDate}</strong>
                </p>
                <p className="text-slate-700">
                  Time Slot:{' '}
                  <strong className="text-slate-900">
                    {pickupSlots.find((s) => s.id === pickupSlotId)?.label}
                  </strong>
                </p>
                <p className="text-slate-500 mt-2 line-clamp-2">
                  Address:{' '}
                  {addresses?.find((a) => a.id === pickupAddressId)?.addressLine},{' '}
                  {addresses?.find((a) => a.id === pickupAddressId)?.locality}
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Delivery Schedule
                </span>
                <p className="text-slate-700">
                  Date: <strong className="text-slate-900">{deliveryDate}</strong>
                </p>
                <p className="text-slate-700">
                  Time Slot:{' '}
                  <strong className="text-slate-900">
                    {deliverySlots.find((s) => s.id === deliverySlotId)?.label}
                  </strong>
                </p>
                <p className="text-slate-700 mt-2">
                  Payment Method: <strong className="text-primary">{paymentMethod}</strong>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-600 block">Total Payable Estimate:</span>
                <span className="text-xl font-black text-primary">
                  ₹{(totalEstimatedInPaise / 100).toFixed(2)}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {selectedItems.reduce((acc, i) => acc + i.quantity, 0)} Items Selected
              </span>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setCurrentStep(6)}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                isLoading={orderMutation.isPending}
                onClick={handleConfirmOrder}
              >
                Confirm & Place Order <CheckCircle2 className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 8: Success Confirmation Screen */}
      {currentStep === 8 && createdOrder && (
        <Card className="border-emerald-200 shadow-md">
          <CardContent className="pt-8 pb-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Booking Confirmed!</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Thank you! Your dry cleaning and laundry pickup request has been recorded. Our Vrindavan
              route partner will arrive during your scheduled time window.
            </p>

            <div className="inline-block bg-slate-50 border border-slate-200 px-6 py-3 rounded-xl my-4">
              <span className="text-xs text-slate-500 block uppercase font-bold tracking-wider">
                Order Tracking Number
              </span>
              <span className="text-xl font-extrabold text-primary block mt-0.5">
                {createdOrder.orderNumber}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
              <Button
                variant="primary"
                onClick={() => navigate(`/orders/${createdOrder.id}`)}
              >
                Track Live Order Timeline
              </Button>
              <Button variant="outline" onClick={() => navigate('/orders')}>
                View My Order History
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
