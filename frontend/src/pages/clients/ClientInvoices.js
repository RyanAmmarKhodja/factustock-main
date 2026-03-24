import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClientInvoices } from "../../api/clientApi";
import { PageHeader, Card, CardHeader, Badge, Alert } from "../../components/ui/UI";
import Loading from "../../components/ui/Loading";
import Button from "../../components/ui/Button";
import styles from "./ClientInvoices.module.css";

const statusConfig = {
  0: { label: "Brouillon",  variant: "neutral"  }, // Draft
  1: { label: "Envoyée",    variant: "primary"  }, // Sent
  2: { label: "Payée",      variant: "success"  }, // Paid
  3: { label: "En retard",  variant: "danger"   }, // Overdue
  4: { label: "Annulée",    variant: "warning"  }, // Cancelled
  Draft:     { label: "Brouillon",  variant: "neutral"  },
  Sent:      { label: "Envoyée",    variant: "primary"  },
  Paid:      { label: "Payée",      variant: "success"  },
  Overdue:   { label: "En retard",  variant: "danger"   },
  Cancelled: { label: "Annulée",    variant: "warning"  },
};

const getStatus = (s) => statusConfig[s] || { label: String(s), variant: "neutral" };

const formatDZD = (amount) =>
  new Intl.NumberFormat("fr-DZ", { style: "currency", currency: "DZD", minimumFractionDigits: 2 }).format(amount);

const formatDate = (d) =>
  new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit", year: "numeric" });

export default function ClientInvoices() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getClientInvoices(id);
      setInvoices(res.data);
    } catch {
      setError("Impossible de charger les factures.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const handleRowClick = (invoiceId) => {
    // TODO: navigate to invoice details when invoicing module is built
    navigate(`/factures/${invoiceId}`);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Factures du client"
        subtitle={`${invoices.length} facture${invoices.length !== 1 ? "s" : ""}`}
        action={
          <Button variant="ghost" onClick={() => navigate(`/clients/${id}`)}>
            ← Retour au client
          </Button>
        }
      />

      {error && <Alert variant="danger" onDismiss={() => setError("")}>{error}</Alert>}

      <Card padding="sm">
        <CardHeader
          title="Historique des factures"
          subtitle="Cliquez sur une ligne pour voir le détail."
        />

        {invoices.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📄</span>
            <p>Aucune facture pour ce client.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>N° Facture</th>
                  <th>Date</th>
                  <th>Échéance</th>
                  <th>Statut</th>
                  <th className={styles.right}>TTC</th>
                  <th className={styles.right}>Payé</th>
                  <th className={styles.right}>Restant</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const status = getStatus(inv.status);
                  return (
                    <tr
                      key={inv.id}
                      className={styles.clickableRow}
                      onClick={() => handleRowClick(inv.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <td className={styles.invoiceNum}>{inv.invoiceNumber}</td>
                      <td>{formatDate(inv.invoiceDate)}</td>
                      <td>{formatDate(inv.dueDate)}</td>
                      <td><Badge variant={status.variant}>{status.label}</Badge></td>
                      <td className={styles.right}>{formatDZD(inv.ttc)}</td>
                      <td className={styles.right}>{formatDZD(inv.amountPaid)}</td>
                      <td className={`${styles.right} ${inv.amountOutstanding > 0 ? styles.outstanding : ""}`}>
                        {formatDZD(inv.amountOutstanding)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
