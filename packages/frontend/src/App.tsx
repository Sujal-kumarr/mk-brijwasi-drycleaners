import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CustomerLayout } from './components/layout/CustomerLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { PartnerLayout } from './components/layout/PartnerLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { LoginPage } from './pages/customer/LoginPage';
import { RegisterPage } from './pages/customer/RegisterPage';
import { ProfilePage } from './pages/customer/ProfilePage';
import { AddressesPage } from './pages/customer/AddressesPage';
import { BookingFlow } from './pages/customer/BookingFlow';
import { OrderHistoryPage, OrderDetailPage } from './pages/customer/OrderPages';
import { HelpPage } from './pages/customer/HelpPage';

// Admin Pages
import { AdminDashboard, AdminPlaceholderPage } from './pages/admin/AdminDashboard';

// Partner Pages
import {
  PartnerDashboard,
  PartnerJobsPage,
  PartnerHistoryPage,
  PartnerEarningsPage,
} from './pages/partner/PartnerDashboard';

export function App() {
  return (
    <Routes>
      {/* Customer Routes */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="help" element={<HelpPage />} />

        {/* Protected Customer Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="book" element={<BookingFlow />} />
          <Route path="orders" element={<OrderHistoryPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route
            path="orders"
            element={<AdminPlaceholderPage title="Order Processing" description="Inspect orders, assign partners, update status" />}
          />
          <Route
            path="catalog"
            element={<AdminPlaceholderPage title="Catalog & Pricing" description="Manage clothing categories, items, services, and price rates" />}
          />
          <Route
            path="customers"
            element={<AdminPlaceholderPage title="Customer Directory" description="Customer accounts, addresses, order history" />}
          />
          <Route
            path="partners"
            element={<AdminPlaceholderPage title="Riders & Fleet" description="Delivery partner profiles, active duty, vehicles" />}
          />
          <Route
            path="payments"
            element={<AdminPlaceholderPage title="Finance & Payments" description="Payment reconciliation, refunds, partner payouts" />}
          />
          <Route
            path="reports"
            element={<AdminPlaceholderPage title="Business Reports" description="Sales breakdown, volume trends, turn-around analytics" />}
          />
          <Route
            path="settings"
            element={<AdminPlaceholderPage title="Business Settings" description="Opening hours, delivery fee rules, service zones" />}
          />
        </Route>
      </Route>

      {/* Delivery Partner Routes */}
      <Route element={<ProtectedRoute allowedRoles={['DELIVERY_PARTNER']} />}>
        <Route path="/partner" element={<PartnerLayout />}>
          <Route index element={<PartnerDashboard />} />
          <Route path="jobs" element={<PartnerJobsPage />} />
          <Route path="history" element={<PartnerHistoryPage />} />
          <Route path="earnings" element={<PartnerEarningsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
