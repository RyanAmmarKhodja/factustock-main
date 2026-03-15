import { useContext, createContext, useState, useEffect } from "react";
import api from "../api/api";
import Loading from "../components/ui/Loading";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("fs_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken]     = useState(localStorage.getItem("fs_token") || "");
  const [loading, setLoading] = useState(true);
  const [setupCompleted, setSetupCompleted] = useState(null); // null = unknown

  // On refresh: re-attach token to axios headers
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      if (!user) logoutClean();
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  // Just updates state. Navigation is handled by the calling component (LoginPage).
  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token: newToken, ...userData } = response.data;

    setToken(newToken);
    setUser(userData);
    localStorage.setItem("fs_token", newToken);
    localStorage.setItem("fs_user", JSON.stringify(userData));
    api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

    return response.data;
  };

  // ── LOGOUT ─────────────────────────────────────────────────────────────────
  // Just clears state. AppRouter's PrivateRoute redirects to /login automatically
  // because token becomes falsy — no navigate() call needed here.
  const logout = () => {
    logoutClean();
  };

  const logoutClean = () => {
    localStorage.removeItem("fs_token");
    localStorage.removeItem("fs_user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    setToken("");
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ token, user, isAdmin, login, logout, setupCompleted, setSetupCompleted }}>
      {!loading
        ? children
        : (
          <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Loading size="lg" />
          </div>
        )
      }
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};