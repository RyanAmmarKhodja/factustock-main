import api from "./api"

// Generate Invoice
export const createInvoice = (data) =>
  api.post("/documents/invoice", data);
