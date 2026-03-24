import api from "./api";

// ─────────────────────────────────────────────
// GET /api/clients — Paginated, searchable list
// ─────────────────────────────────────────────
export const getClients = (params = {}) =>
  api.get("/clients", { params });

// ─────────────────────────────────────────────
// GET /api/clients/:id — Single client detail
// ─────────────────────────────────────────────
export const getClient = (id) =>
  api.get(`/clients/${id}`);

// ─────────────────────────────────────────────
// POST /api/clients — Create client
// ─────────────────────────────────────────────
export const createClient = (data) =>
  api.post("/clients", data);

// ─────────────────────────────────────────────
// PUT /api/clients/:id — Update client
// ─────────────────────────────────────────────
export const updateClient = (id, data) =>
  api.put(`/clients/${id}`, data);

// ─────────────────────────────────────────────
// PATCH /api/clients/:id/archive — Soft delete
// ─────────────────────────────────────────────
export const archiveClient = (id) =>
  api.patch(`/clients/${id}/archive`);

// ─────────────────────────────────────────────
// PATCH /api/clients/:id/restore — Un-archive
// ─────────────────────────────────────────────
export const restoreClient = (id) =>
  api.patch(`/clients/${id}/restore`);

// ─────────────────────────────────────────────
// GET /api/clients/:id/stats — Financial stats
// ─────────────────────────────────────────────
export const getClientStats = (id) =>
  api.get(`/clients/${id}/stats`);

// ─────────────────────────────────────────────
// GET /api/clients/:id/invoices — Invoice list
// ─────────────────────────────────────────────
export const getClientInvoices = (id) =>
  api.get(`/clients/${id}/invoices`);
