import api from "./api";

export const createInvoice = (data) =>
  api.post("/documents/invoice", data);
