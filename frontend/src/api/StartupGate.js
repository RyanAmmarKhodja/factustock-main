import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSetupStatus } from "./authApi";
import Loading from "../components/ui/Loading";

export default function StartupGate({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getSetupStatus()
      .then((res) => {
        if (!res.data.isSetupCompleted) {
          navigate("/setup", { replace: true });
        }
      })
      .catch(() => {
        console.error("Setup status check failed");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loading size="lg" />
      </div>
    );
  }

  return children;
}