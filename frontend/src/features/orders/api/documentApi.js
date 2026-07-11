import api from "../../../shared/api/api";

export const createInvoice = (data) =>
  api.post("/documents/invoice", data);
