import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClientStats } from "../../api/clientApi";
import { PageHeader, StatCard, Alert } from "../../components/ui/UI";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import styles from "./ClientStats.module.css";

/**
 * Format amounts in DZD.
 */
const formatDZD = (amount) =>
  new Intl.NumberFormat("fr-DZ", { style: "currency", currency: "DZD", minimumFractionDigits: 2 }).format(amount);

export default function ClientStats() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getClientStats(id);
      setStats(res.data);
    } catch {
      setError("Impossible de charger les statistiques.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) return <Loading />;
  if (error) {
    return (
      <div>
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" size="md" onClick={() => navigate(`/clients/${id}`)} style={{ marginTop: 16 }}>
          ← Retour au client
        </Button>
      </div>
    );
  }
  if (!stats) return null;

  return (
    <div>
      <PageHeader
        title={`Statistiques — ${stats.clientName}`}
        subtitle="Résumé financier du client."
        action={
          <Button variant="primary" size="md" onClick={() => navigate(`/clients/${id}`)}>
            ← Retour au client
          </Button>
        }
      />

      {/* Invoice counts */}
      <div className={styles.statsGrid}>
        <StatCard
          label="Total factures"
          value={stats.totalInvoices}
          color="primary"
          
        />
        <StatCard
          label="Payées"
          value={stats.paidInvoices}
          color="success"
          
        />
        <StatCard
          label="En attente"
          value={stats.pendingInvoices}
          color="warning"
          
        />
        <StatCard
          label="En retard"
          value={stats.overdueInvoices}
          color="danger"
         
        />
      </div>

      {/* Financial amounts */}
      <div className={styles.statsGrid}>
        <StatCard
          label="Total facturé (TTC)"
          value={formatDZD(stats.totalInvoicedTTC)}
          color="primary"
         
        />
        <StatCard
          label="Total encaissé"
          value={formatDZD(stats.totalPaid)}
          color="success"
         
        />
        <StatCard
          label="Restant dû"
          value={formatDZD(stats.totalOutstanding)}
          color={stats.totalOutstanding > 0 ? "danger" : "success"}
         
        />
      </div>

      {/* CTA */}
      <div className={styles.cta}>
        <Button onClick={() => navigate(`/clients/${id}/factures`)}>
           Voir les factures
        </Button>
      </div>
    </div>
  );
}
