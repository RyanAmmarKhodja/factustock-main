import api from "../../../shared/api/api";

export const getLogs = (params) =>
  api.get("/logs", { params });
