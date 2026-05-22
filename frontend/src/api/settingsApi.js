import api from "./api";

export const getCompany = () =>
  api.get("/system/company");

export const updateCompany = (data) =>
  api.put("/system/company", data);
