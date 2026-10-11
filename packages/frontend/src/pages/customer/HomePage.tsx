import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Truck,
  ShieldCheck,
  Clock,
  Shirt,
  Wind,
  CheckCircle2,
  ChevronRight,
  PhoneCall,
  MapPin,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function HomePage() {
  const services = [
    {
      title: 'Wash & Fold',
      desc: 'Regular everyday wear gently cleaned, dried, and crisply folded.',
      icon: Shirt,
      badge: 'Popular',
    },
    {
      title: 'Wash & Iron',
      desc: 'Complete washing with precision steam pressing for crisp office attire.',
      icon: Wind,
      badge: 'Daily Favorite',
    },
    {
      title: 'Steam Iron Only',
      desc: 'Wrinkle-free high-temperature steam ironing for delicate fabrics.',
      icon: Sparkles,
      badge: 'Quick Turnaround',
    },
    {
      title: 'Premium Dry Cleaning',
      desc: 'Eco-safe solvent cleaning for suits, silk sarees, lehengas & blazers.',
      icon: ShieldCheck,
      badge: 'Expert Care',
    },
    {
      title: 'Stain Treatment',
      desc: 'Targeted scientific treatment for stubborn grease, oil, and food stains.',
      icon: CheckCircle2,
      badge: 'Specialist',
    },
    {
      title: 'Bulky & Linen Cleaning',
      desc: 'Deep cleaning for winter blankets, heavy comforters, and curtains.',
      icon: Clock,
      badge: 'Heavy Fabric',
    },
  ];

  const benefits = [
    {
      icon: Truck,
      title: 'Doorstep Pickup & Delivery',
      desc: 'Schedule a time slot that suits you. Our dedicated rider picks up and delivers right to your door.',
    },
    {
      icon: ShieldCheck,
      title: 'Transparent Pricing & No Surprises',
      desc: 'Clear upfront rate card per garment or weight. Itemized digital receipts provided every time.',
    },
    {
      icon: Sparkles,
      title: 'Vrindavan Holy Fabric Care',
      desc: 'Experienced artisans treating ethnic fabrics, silk, and deity garments with supreme reverence.',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-slate-800 to-primary-dark text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F39C12_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent-light text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> Premium Fabric Care in Braj
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              MK Brijwasi <span className="text-accent">Drycleaners</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl font-light leading-relaxed">
              Vrindavan & Mathura’s trusted laundry and dry cleaning service. Expert care for designer sarees, formal suits, daily wear, and holy robes with convenient scheduled doorstep pickup.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <Link to="/book">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto font-semibold">
                  Book Pickup Now
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/help">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent border-slate-400 text-white hover:bg-white/10">
                  View Price List
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-accent" /> 48-Hour Turnaround
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-accent" /> Safe Solvent Clean
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-accent" /> Free Pickup &gt; ₹299
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl max-w-sm w-full space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent rounded-xl text-white">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Fast Booking Hotline</h3>
                  <p className="text-xs text-slate-300">Call or WhatsApp for immediate pickup</p>
                </div>
              </div>
              <div className="text-2xl font-bold tracking-wider text-accent-light">+91 99999 99999</div>
              <div className="border-t border-white/10 pt-4 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Operating Hours:</span>
                  <span className="font-medium text-white">8:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Coverage:</span>
                  <span className="font-medium text-white">Vrindavan • Mathura • Govardhan</span>
                </div>
              </div>
              <Link to="/book" className="block">
                <Button variant="primary" className="w-full bg-primary hover:bg-primary-light">
                  Schedule Online
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold text-accent tracking-widest">Our Expertise</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-1">Services Tailored for Every Fabric</h2>
          <p className="text-slate-600 mt-2 text-sm">
            From daily cotton laundry to high-end festive apparel, we inspect and treat every piece with the highest hygiene standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-accent-dark bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      {srv.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{srv.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{srv.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Learn more</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Why Vrindavan Chooses MK Brijwasi</h2>
            <p className="text-slate-600 mt-2 text-sm">
              We combine modern fabric care technology with courteous neighborhood service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
                  <div className="mx-auto w-14 h-14 bg-accent/15 rounded-2xl flex items-center justify-center text-accent">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{b.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Areas Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary rounded-2xl text-white p-8 sm:p-12 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 text-accent-light text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-accent" /> Active Service Zones
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">Serving Vrindavan, Mathura & Govardhan</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              We provide scheduled slots throughout the day. Check your pincode at checkout or book directly online to enjoy prompt door-step pickup.
            </p>
          </div>
          <Link to="/book">
            <Button variant="secondary" size="lg" className="whitespace-nowrap font-bold">
              Check Pincode & Order
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
