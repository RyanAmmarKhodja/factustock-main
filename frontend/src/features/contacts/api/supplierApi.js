import api from "../../../shared/api/api"

export const getSuppliers = (params = {}) =>
    api.get("/suppliers", {params});

export const getSupplier = (id) =>
    api.get(`/suppliers/${id}`);

export const createSupplier = (data) =>
    api.post(`/suppliers`, data)

export const updateSupplier = (id, data) =>
  api.put(`/suppliers/${id}`, data);

export const archiveSupplier = (id) =>
  api.patch(`/suppliers/${id}/archive`);

export const restoreSupplier = (id) =>
  api.patch(`/suppliers/${id}/restore`);

// export const getSupplierStats = (id) =>
//   api.get(`/suppliers/${id}/stats`);

export const getSupplierInvoices = (id) =>
  api.get(`/suppliers/${id}/invoices`);
