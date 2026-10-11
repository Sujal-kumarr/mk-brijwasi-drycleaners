import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Phone, Mail, MapPin, Clock, AlertCircle } from 'lucide-react';

export function HelpPage() {
  const faqs = [
    {
      q: 'How does pickup & delivery work in Vrindavan?',
      a: 'Choose your preferred pickup slot online. Our rider collects your laundry bag, inspects items, and issues a digital receipt. Once cleaned and steam pressed, we deliver it back right to your address.',
    },
    {
      q: 'What is your cancellation policy?',
      a: 'You can cancel or reschedule an order free of charge up to 2 hours before the scheduled pickup window. If a rider is already dispatched, a minimal logistics fee of ₹30 may apply.',
    },
    {
      q: 'How are delicate silks and Thakur Ji poshak handled?',
      a: 'We have dedicated dry cleaning cycles with mild, eco-safe solvents tailored specifically for embroidered silk, velvet, zari work, and deity garments.',
    },
    {
      q: 'What is the standard turnaround time?',
      a: 'Standard laundry and wash & fold take 24 to 48 hours. Premium dry cleaning and stain treatment take 48 to 72 hours depending on fabric requirements.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <PageHeader
        title="Help & Customer Care"
        description="Frequently asked questions, service policies, and store contacts"
      />

      {/* Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Phone className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-900">Phone & WhatsApp</h4>
            <p className="text-sm text-slate-500">+91 99999 99999</p>
            <span className="text-xs text-slate-400">Available 8am - 8pm</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <Mail className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-900">Email Support</h4>
            <p className="text-sm text-slate-500">care@mkbrijwasidrycleaners.com</p>
            <span className="text-xs text-slate-400">Responses within 4 hours</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <MapPin className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-900">Main Facility</h4>
            <p className="text-sm text-slate-500">Banke Bihari Road, Vrindavan</p>
            <span className="text-xs text-slate-400">Mathura, UP 281121</span>
          </CardContent>
        </Card>
      </div>

      {/* Cancellation and Policies */}
      <Card className="border-amber-200 bg-amber-50/40">
        <CardHeader>
          <CardTitle className="text-amber-900 flex items-center gap-2 text-base">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Cancellation & Minimum Order Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-amber-800">
          <p>
            • <strong>Minimum Order Amount:</strong> ₹100 per pickup order.
          </p>
          <p>
            • <strong>Delivery Fee:</strong> ₹30 for standard orders; free delivery on orders over ₹299.
          </p>
          <p>
            • <strong>Free Cancellation:</strong> Permitted up to 2 hours prior to the booked time slot.
          </p>
        </CardContent>
      </Card>

      {/* FAQs */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h3>
        <div className="grid grid-cols-1 gap-4">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-start gap-2">
                  <span className="text-primary font-bold">Q:</span> {faq.q}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed pl-6">{faq.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
