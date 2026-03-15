import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import ClientLayout from "../components/layout/ClientLayout";

import LoginPage     from "../pages/auth/LoginPage";
import SetupPage     from "../pages/auth/SetupPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import UsersPage     from "../pages/users/UsersPage";


export default function AppRouter() {
  const { token, isAdmin, setupCompleted } = useAuth();

  const PrivateRoute = () =>
    token ? (
      <ClientLayout><Outlet /></ClientLayout>
    ) : (
      <Navigate to="/login" replace />
    );

  // Must be admin
  const AdminRoute = () =>
    token && isAdmin ? <Outlet /> : <Navigate to="/" replace />;

  // Public only (logged out)
  const PublicRoute = () =>
    !token ? <Outlet /> : <Navigate to="/" replace />;

  // Only accessible when setup is NOT completed
  const SetupRoute = () =>
    setupCompleted === false ? <Outlet /> : <Navigate to="/login" replace />;

  return (
    <Routes>
      {/* Setup — only when setupCompleted === false */}
      <Route element={<SetupRoute />}>
        <Route path="/setup" element={<SetupPage />} />
      </Route>

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/home" element={<DashboardPage />} />

        {/* Admin-only routes */}
        <Route element={<AdminRoute />}>
          <Route path="/utilisateurs" element={<UsersPage />} />
          {/* Future: <Route path="/journal" element={<AuditLogPage />} /> */}
        </Route>

        {/* <Route path="/clients"    element={<ClientsPage />} /> */}
        {/* <Route path="/produits"   element={<ProduitsPage />} /> */}
        {/* <Route path="/factures"   element={<FacturesPage />} /> */}
        {/* <Route path="/parametres" element={<SettingsPage />} /> */}
      </Route>

      {/* Catch-all */}
      {/* <Route path="*" element={<PageNotFound />} /> */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}