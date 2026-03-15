import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSetupStatus } from "./authApi";
import Loading from "../components/ui/Loading";

export default function StartupGate({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { setSetupCompleted } = useAuth();

  useEffect(() => {
    getSetupStatus()
      .then((res) => {
        const completed = res.data.setupCompleted;
        setSetupCompleted(completed);

        if (!completed) {
          // Setup not done yet — redirect to /setup only if not already there
          if (location.pathname !== "/setup") {
            navigate("/setup", { replace: true });
          }
        } else {
          // Setup is done — if user is on /setup, kick them to /login
          if (location.pathname === "/setup") {
            navigate("/login", { replace: true });
          }
          // Otherwise let AppRouter handle it normally
        }
      })
      .catch(() => {
        console.error("Setup status check failed");
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loading size="lg" />
      </div>
    );
  }

  return children;
}