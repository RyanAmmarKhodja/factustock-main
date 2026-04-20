import api from "./api";

// ─────────────────────────────────────────────
// POST /api/products — Create product
// ─────────────────────────────────────────────
export const createProduct = (data) =>
api.post("/products", data);

// ─────────────────────────────────────────────
// GET /api/products — List products
// ─────────────────────────────────────────────
export const getProducts = (params = {}) =>
api.get("/products", { params });

// ─────────────────────────────────────────────
// PUT /api/products/:id — Full update
// ─────────────────────────────────────────────
export const updateProduct = (id, data) =>
api.put(`/products/${id}`, data);

// ─────────────────────────────────────────────
// GET /api/products/:id — Single product detail
// ─────────────────────────────────────────────
export const getProduct = (id) =>
api.get(`/products/${id}`);

// ─────────────────────────────────────────────
// GET /api/products/low-stock — Low stock alerts
// ─────────────────────────────────────────────
export const getLowStockProducts = () =>
api.get("/products/low-stock");

// ─────────────────────────────────────────────
// GET /api/products/categories — Category list
// ─────────────────────────────────────────────
export const getProductCategories = () =>
api.get("/products/categories");

// ─────────────────────────────────────────────
// GET /api/products/search — Search products
// ─────────────────────────────────────────────
export const searchProducts = (params = {}) =>
api.get("/products/search", { params });

// ─────────────────────────────────────────────
// GET /api/products/:id/stock-history — Logs
// ─────────────────────────────────────────────
export const getProductStockHistory = (id) =>
api.get(`/products/${id}/stock-history`);

// ─────────────────────────────────────────────
// PATCH /api/products/:id/adjust-stock — Inventory
// ─────────────────────────────────────────────
export const adjustProductStock = (id, data) =>
api.patch(`/products/${id}/adjust-stock`, data);

// ─────────────────────────────────────────────
// PATCH /api/products/:id/archive — Soft delete
// ─────────────────────────────────────────────
export const archiveProduct = (id) =>
api.patch(`/products/${id}/archive`);

// ─────────────────────────────────────────────
// PATCH /api/products/:id/restore — Un-archive
// ─────────────────────────────────────────────
export const restoreProduct = (id) =>
api.patch(`/products/${id}/restore`);