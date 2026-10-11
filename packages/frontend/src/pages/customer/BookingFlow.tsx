import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Sparkles, Calendar, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export function BookingFlow() {
  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Pickup request submitted! Our partner will be assigned shortly.');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <PageHeader
        title="Schedule a Pickup"
        description="Select date, time window, and address in Vrindavan or Mathura"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" /> Express Laundry & Dry Cleaning Booking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" /> Pickup Address
              </label>
              <select className="w-full rounded-md border border-slate-300 p-2 text-sm">
                <option>Flat 204, Krishna Enclave, Raman Reti, Vrindavan (281121)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-slate-400" /> Pickup Date
                </label>
                <input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-md border border-slate-300 p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" /> Time Window
                </label>
                <select className="w-full rounded-md border border-slate-300 p-2 text-sm">
                  <option>9am - 12pm (Morning)</option>
                  <option>12pm - 3pm (Afternoon)</option>
                  <option>3pm - 6pm (Evening)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Special Instructions (Optional)
              </label>
              <textarea
                placeholder="e.g. Ring the bell twice, Thakur Ji poshak included, heavy stains on kurta"
                rows={3}
                className="w-full rounded-md border border-slate-300 p-2 text-sm"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full mt-4">
              Confirm & Book Pickup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
