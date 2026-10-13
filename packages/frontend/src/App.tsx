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
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { CatalogPage } from './pages/admin/CatalogPage';
import { CustomersPage } from './pages/admin/CustomersPage';
import { PartnersPage } from './pages/admin/PartnersPage';
import { PaymentsPage } from './pages/admin/PaymentsPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { SettingsPage } from './pages/admin/SettingsPage';

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
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="partners" element={<PartnersPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
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
