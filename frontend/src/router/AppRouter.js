import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import ClientLayout from "../components/layout/ClientLayout";

import LoginPage       from "../pages/auth/LoginPage";
import SetupPage       from "../pages/auth/SetupPage";
import DashboardPage   from "../pages/dashboard/DashboardPage";
import UsersPage       from "../pages/users/UsersPage";
import ClientsPage     from "../pages/clients/ClientsPage";
import ClientDetails   from "../pages/clients/ClientDetails";
import ClientStats     from "../pages/clients/ClientStats";
import ClientInvoices  from "../pages/clients/ClientInvoices";
import SuppliersPage   from "../pages/suppliers/SuppliersPage";
import SupplierDetails from "../pages/suppliers/SupplierDetails";
import SupplierInvoices from "../pages/suppliers/SupplierInvoices";
import ProductsPage    from "../pages/products/ProductsPage";
import ProductDetails  from "../pages/products/ProductDetails";
import GenerateInvoice from "../pages/invoice/GenerateInvoice";
import InvoicesPage    from "../pages/invoice/InvoicesPage";
import InvoiceDetails  from "../pages/invoice/InvoiceDetails";
import AuditLogPage    from "../pages/logs/AuditLogPage";
import SettingsPage    from "../pages/settings/SettingsPage";

export default function AppRouter() {
  const { token, isAdmin, setupCompleted } = useAuth();

  const PrivateRoute = () =>
    token ? <ClientLayout><Outlet /></ClientLayout> : <Navigate to="/login" replace />;

  const AdminRoute = () =>
    token && isAdmin ? <Outlet /> : <Navigate to="/" replace />;

  const PublicRoute = () =>
    !token ? <Outlet /> : <Navigate to="/" replace />;

  const SetupRoute = () =>
    setupCompleted === false ? <Outlet /> : <Navigate to="/login" replace />;

  return (
    <Routes>
      <Route element={<SetupRoute />}>
        <Route path="/setup" element={<SetupPage />} />
      </Route>

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route path="/"         element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/home"     element={<DashboardPage />} />

        {/* Admin-only */}
        <Route element={<AdminRoute />}>
          <Route path="/utilisateurs" element={<UsersPage />} />
        </Route>

        {/* CRM */}
        <Route path="/clients"                   element={<ClientsPage />} />
        <Route path="/clients/:id"               element={<ClientDetails />} />
        <Route path="/clients/:id/stats"         element={<ClientStats />} />
        <Route path="/clients/:id/invoices"      element={<ClientInvoices />} />

        <Route path="/suppliers"                 element={<SuppliersPage />} />
        <Route path="/suppliers/:id"             element={<SupplierDetails />} />
        <Route path="/suppliers/:id/invoices"    element={<SupplierInvoices />} />

        <Route path="/products"                  element={<ProductsPage />} />
        <Route path="/products/:id"              element={<ProductDetails />} />

        {/* Invoices — order matters: /generate before /:id */}
        <Route path="/invoices"                  element={<InvoicesPage />} />
        <Route path="/invoices/generate"         element={<GenerateInvoice />} />
        <Route path="/invoices/:id"              element={<InvoiceDetails />} />

        {/* Journal & Settings */}
        <Route path="/logs"                      element={<AuditLogPage />} />
        <Route path="/settings"                  element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
