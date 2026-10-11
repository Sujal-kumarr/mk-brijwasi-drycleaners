import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Truck, CheckCircle2, DollarSign, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';

export function PartnerLayout() {
  const { user, clearAuth } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/partner', icon: Truck },
    { label: 'Active Jobs', href: '/partner/jobs', icon: CheckCircle2 },
    { label: 'Earnings', href: '/partner/earnings', icon: DollarSign },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      {/* Top Bar */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between">
        <span className="font-bold text-primary text-base">MK Brijwasi Partner</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{user?.firstName || 'Rider'}</span>
          <button
            onClick={handleLogout}
            className="p-1 rounded text-slate-400 hover:text-red-500"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        <Outlet />
      </main>

      {/* Bottom Nav for mobile riders */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around z-40">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-1 px-3 text-xs font-medium',
                isActive ? 'text-primary font-semibold' : 'text-slate-500 hover:text-slate-900'
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
