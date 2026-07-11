import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import ClientLayout from "../layout/ClientLayout";

import LoginPage       from "../../features/auth/pages/LoginPage";
import SetupPage       from "../../features/auth/pages/SetupPage";
import DashboardPage   from "../../features/dashboard/pages/DashboardPage";
import UsersPage       from "../../features/team/pages/UsersPage";
import ClientsPage     from "../../features/contacts/pages/ClientsPage";
import ClientDetails   from "../../features/contacts/pages/ClientDetails";
import ClientStats     from "../../features/contacts/pages/ClientStats";
import ClientInvoices  from "../../features/contacts/pages/ClientInvoices";
import SuppliersPage   from "../../features/contacts/pages/SuppliersPage";
import SupplierDetails from "../../features/contacts/pages/SupplierDetails";
import SupplierInvoices from "../../features/contacts/pages/SupplierInvoices";
import ProductsPage    from "../../features/stock/pages/ProductsPage";
import ProductDetails  from "../../features/stock/pages/ProductDetails";
import GenerateInvoice from "../../features/billing/pages/GenerateInvoice";
import InvoicesPage    from "../../features/billing/pages/InvoicesPage";
import InvoiceDetails  from "../../features/billing/pages/InvoiceDetails";
import AuditLogPage    from "../../features/audit/pages/AuditLogPage";
import SettingsPage    from "../../features/settings/pages/SettingsPage";
import DocumentsPage  from "../../features/orders/pages/DocumentsPage";
import GenerateBon    from "../../features/orders/pages/GenerateBon";
import BonDetails     from "../../features/orders/pages/BonDetails";

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

        {/* Documents (Bons) — order: /create before /:id */}
        <Route path="/documents"                 element={<DocumentsPage />} />
        <Route path="/documents/create"          element={<GenerateBon />} />
        <Route path="/documents/:id"             element={<BonDetails />} />

        {/* Journal & Settings */}
        <Route path="/logs"                      element={<AuditLogPage />} />
        <Route path="/settings"                  element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
