import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/src/context/AuthContext";
import { I18nProvider } from "@/src/context/I18nContext";
import { Layout } from "@/src/components/Layout";
import { LandingPage } from "@/src/pages/LandingPage";
import { LoginPage } from "@/src/pages/LoginPage";
import { RegisterPage } from "@/src/pages/RegisterPage";
import { DashboardPage } from "@/src/pages/DashboardPage";
import { BuyUsdtPage } from "@/src/pages/BuyUsdtPage";
import { OrderHistoryPage } from "@/src/pages/OrderHistoryPage";
import { OrderDetailPage } from "@/src/pages/OrderDetailPage";
import { AdminOrdersPage } from "@/src/pages/AdminOrdersPage";
import { AdminOrderDetailPage } from "@/src/pages/AdminOrderDetailPage";
import { AdminUsersPage } from "@/src/pages/AdminUsersPage";
import { AdminSettingsPage } from "@/src/pages/AdminSettingsPage";
import { AdminBitkubConfigPage } from "@/src/pages/AdminBitkubConfigPage";
import { ProfileSettingsPage } from "@/src/pages/ProfileSettingsPage";
import { UnauthorizedPage, NotFoundPage } from "@/src/pages/ErrorPages";

function ProtectedRoute({ children, roles }: { children: React.ReactNode, roles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" />;

  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Customer Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute roles={["CUSTOMER", "ADMIN"]}>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/buy" element={
              <ProtectedRoute roles={["CUSTOMER"]}>
                <BuyUsdtPage />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute roles={["CUSTOMER"]}>
                <OrderHistoryPage />
              </ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute roles={["CUSTOMER", "ADMIN"]}>
                <OrderDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute roles={["CUSTOMER", "ADMIN"]}>
                <ProfileSettingsPage />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/orders" element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminOrdersPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/orders/:id" element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminOrderDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminUsersPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminSettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/bitkub" element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminBitkubConfigPage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </I18nProvider>
  );
}
