import api from "./api";

// ─────────────────────────────────────────────
// Called on app load to decide which page to show:
//   { isAdminRegistered, isCompanyConfigured, companyName }
// ─────────────────────────────────────────────
export const getSetupStatus = () =>
  api.get("/api/auth/setup-status");

// ─────────────────────────────────────────────
// One-time admin creation (only works if no admin exists yet)
// ─────────────────────────────────────────────
export const registerAdmin = (data) =>
  api.post("/api/auth/register/admin", data);

// ─────────────────────────────────────────────
// Login — returns JWT token + user info
// ─────────────────────────────────────────────
export const login = (data) =>
  api.post("/api/auth/login", data);

// ─────────────────────────────────────────────
// Admin creates employee account
// ─────────────────────────────────────────────
export const registerEmployee = (data) =>
  api.post("/api/auth/register/employee", data);

// ─────────────────────────────────────────────
// Get all users + seat usage info
// ─────────────────────────────────────────────
export const getUsers = () =>
  api.get("/api/auth/users");

// ─────────────────────────────────────────────
// Update user info (admin only)
// ─────────────────────────────────────────────
export const updateUser = (id, data) =>
  api.put(`/api/auth/users/${id}`, data);

// ─────────────────────────────────────────────
// Deactivate employee (frees seat)
// ─────────────────────────────────────────────
export const deactivateUser = (id) =>
  api.delete(`/api/auth/users/${id}/deactivate`);

// ─────────────────────────────────────────────
// Change own password
// ─────────────────────────────────────────────
export const changePassword = (data) =>
  api.post("/api/auth/change-password", data);