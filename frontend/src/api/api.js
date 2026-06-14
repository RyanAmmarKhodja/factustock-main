import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL: `${API_URL}`,
});

// AuthContext registers its logoutClean here so the interceptor can call it.
let _logoutCallback = null;
export const setLogoutCallback = (fn) => { _logoutCallback = fn; };

// Intercept every response — if the server says 401, the token is expired/invalid.
// Call logout so the user is cleanly redirected to /login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && _logoutCallback) {
      _logoutCallback();
    }
    return Promise.reject(error);
  }
);

export default api;