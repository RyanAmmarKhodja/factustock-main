import api from "../../../shared/api/api";

// ─────────────────────────────────────────────
// POST /api/bons — Generate a bon
// ─────────────────────────────────────────────
export const createBon = (data) =>
  api.post("/bons", data);

// ─────────────────────────────────────────────
// GET /api/bons — List bons (paginated)
// ─────────────────────────────────────────────
export const getBons = (params = {}) =>
  api.get("/bons", { params });

// ─────────────────────────────────────────────
// GET /api/bons/:id — Single bon detail
// ─────────────────────────────────────────────
export const getBon = (id) =>
  api.get(`/bons/${id}`);
