import api from "./api";

export const getInvoices = (params) =>
  api.get("/invoices", { params });

export const getInvoice = (id) =>
  api.get(`/invoices/${id}`);
