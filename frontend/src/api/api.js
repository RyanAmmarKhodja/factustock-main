import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: `${API_URL}`,
});

// Add interceptor
api.interceptors.response.use(
  (response) => response, // for successful responses
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token expired or unauthorized, logging out...");
      //logoutUser(); // custom logout function (defined below)
    }
    return Promise.reject(error);
  }
);

export default api;