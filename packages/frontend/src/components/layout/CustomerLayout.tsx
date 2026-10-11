import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, Sparkles, User, ShoppingBag, MapPin, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';

export function CustomerLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md group-hover:bg-primary-light transition-colors">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight text-primary">MK Brijwasi</span>
                <span className="text-[11px] font-medium tracking-widest uppercase text-accent-dark">Drycleaners</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link to="/" className="text-slate-600 hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/help" className="text-slate-600 hover:text-primary transition-colors">
                Services & Pricing
              </Link>
              <Link to="/help" className="text-slate-600 hover:text-primary transition-colors">
                Help & FAQs
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
                  <Link to="/orders" className="flex items-center gap-1.5 text-slate-700 hover:text-primary">
                    <ShoppingBag className="w-4 h-4" />
                    <span>My Orders</span>
                  </Link>
                  <Link to="/addresses" className="flex items-center gap-1.5 text-slate-700 hover:text-primary">
                    <MapPin className="w-4 h-4" />
                    <span>Addresses</span>
                  </Link>
                  <Link to="/profile" className="flex items-center gap-1.5 text-slate-700 hover:text-primary">
                    <User className="w-4 h-4" />
                    <span>{user?.firstName || 'Profile'}</span>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500 hover:text-red-600">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login">
                    <Button variant="outline" size="sm">Log In</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">Register</Button>
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-primary hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              Home
            </Link>
            <Link
              to="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              Services & Pricing
            </Link>
            <Link
              to="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
            >
              Help & FAQ
            </Link>

            {isAuthenticated ? (
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
                >
                  <ShoppingBag className="w-5 h-5" /> My Orders
                </Link>
                <Link
                  to="/addresses"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
                >
                  <MapPin className="w-5 h-5" /> Saved Addresses
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
                >
                  <User className="w-5 h-5" /> Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" /> Log Out
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Log In</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">Register</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Page Body */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4 text-accent" />
                </div>
                <span className="font-bold text-lg text-white">MK Brijwasi Drycleaners</span>
              </div>
              <p className="text-sm text-slate-400">
                Premium garment care & dry cleaning services in Vrindavan, Mathura & Govardhan with free door-step pickup and delivery.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Pricing & Services</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">FAQs & Support</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Customer Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Service Areas</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Vrindavan (PIN 281121)</li>
                <li>Mathura City (PIN 281001)</li>
                <li>Govardhan (PIN 281502)</li>
                <li>Express Pickups Available</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">Contact Us</h4>
              <p className="text-sm text-slate-400">Near Banke Bihari Temple Road, Vrindavan, UP</p>
              <p className="text-sm text-slate-400 mt-2">Phone: +91 9999999999</p>
              <p className="text-sm text-slate-400">Email: contact@mkbrijwasidrycleaners.com</p>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} MK Brijwasi Drycleaners. All rights reserved. Built for quality fabric care.
          </div>
        </div>
      </footer>
    </div>
  );
}
