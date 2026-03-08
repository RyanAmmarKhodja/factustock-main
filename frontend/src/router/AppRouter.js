import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSetupStatus } from "../api/authApi";

// Layouts
import ClientLayout from "../components/layout/ClientLayout";

// Pages
import LoginPage     from "../pages/auth/LoginPage";
import SetupPage     from "../pages/auth/SetupPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import UsersPage     from "../pages/users/UsersPage";
// import PageNotFound from "../pages/PageNotFound"; // add your existing one

export default function AppRouter() {
  const { token, isAdmin } = useAuth();

  // Check on load whether admin has been created yet
  const [setupChecked, setSetupChecked] = useState(false);
  const [adminExists, setAdminExists]   = useState(true); // assume true until checked

  useEffect(() => {
    getSetupStatus()
      .then(res => setAdminExists(res.data.isAdminRegistered))
      .catch(() => setAdminExists(true))   // on error, fall through to login
      .finally(() => setSetupChecked(true));
  }, []);

  // Show nothing while checking (avoid flash)
  if (!setupChecked) return null;

  // ── Route guards ────────────────────────────────────────────────────────────

  // Must be logged in
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

  return (
    <Routes>
      {/* ── Public ─────────────────────────────────────────────────────────── */}
      <Route element={<PublicRoute />}>
        {/* First-time setup — show only if no admin exists */}
        {!adminExists && (
          <Route path="/setup" element={<SetupPage />} />
        )}
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* ── Protected ──────────────────────────────────────────────────────── */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<DashboardPage />} />

        {/* Admin-only routes */}
        <Route element={<AdminRoute />}>
          <Route path="/utilisateurs" element={<UsersPage />} />
          {/* Future: <Route path="/journal" element={<AuditLogPage />} /> */}
        </Route>

        {/* Shared routes (add as modules are built) */}
        {/* <Route path="/clients"    element={<ClientsPage />} /> */}
        {/* <Route path="/produits"   element={<ProduitsPage />} /> */}
        {/* <Route path="/factures"   element={<FacturesPage />} /> */}
        {/* <Route path="/parametres" element={<SettingsPage />} /> */}
      </Route>

      {/* ── Redirects ──────────────────────────────────────────────────────── */}
      {/* If no admin registered and user hits / or /login, send to /setup */}
      {!adminExists && (
        <Route path="*" element={<Navigate to="/setup" replace />} />
      )}

      {/* Catch-all */}
      {/* <Route path="*" element={<PageNotFound />} /> */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}