import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getInvoices } from "../api/invoiceApi";
import { PageHeader, Card, CardHeader, Badge, Alert } from "../../../shared/components/UI";
import Button from "../../../shared/components/Button";
import Loading from "../../../shared/components/Loading";
import styles from "../styles/InvoicesPage.module.css";

const STATUS_BADGE = {
  Draft:     "neutral",
  Sent:      "primary",
  Paid:      "success",
  Overdue:   "danger",
  Cancelled: "warning",
};

const STATUS_LABEL = {
  Draft:     "Brouillon",
  Sent:      "Envoyée",
  Paid:      "Payée",
  Overdue:   "En retard",
  Cancelled: "Annulée",
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

const formatDA = (n) =>
  Number(n).toLocaleString("fr-DZ", { minimumFractionDigits: 2 }) + " DA";

export default function InvoicesPage() {
  const navigate = useNavigate();

  const [data, setData]       = useState({ items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 });
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchInvoices = useCallback(async (p = 1, s = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await getInvoices({ search: s || undefined, page: p, pageSize: 20 });
      setData(res.data);
    } catch {
      setError("Impossible de charger la liste des factures.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvoices(1, ""); }, [fetchInvoices]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    fetchInvoices(1, val);
  };

  const goTo = (p) => { setPage(p); fetchInvoices(p, search); };

  return (
    <div>
      <PageHeader
        title="Factures"
        subtitle="Historique de toutes les factures générées."
        action={
          <Button size="lg" onClick={() => navigate("/invoices/generate")}>
            + Nouvelle facture
          </Button>
        }
      />

      {/* Search bar */}
      <div className={styles.searchRow}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Rechercher par N° ou client..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      {error && <Alert variant="danger" onDismiss={() => setError("")}>{error}</Alert>}

      <Card padding="sm" className={styles.tableCard}>
        <CardHeader
          title="Liste des factures"
          subtitle={`${data.totalCount} facture${data.totalCount !== 1 ? "s" : ""} trouvée${data.totalCount !== 1 ? "s" : ""}`}
        />

        {loading ? (
          <Loading />
        ) : data.items.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🧾</span>
            <p>Aucune facture trouvée.</p>
            <Button onClick={() => navigate("/invoices/generate")} style={{ marginTop: "1rem" }}>
              Créer la première facture
            </Button>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>N° Facture</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Échéance</th>
                    <th>Total TTC</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <span className={styles.invoiceNumber}>{inv.invoiceNumber}</span>
                      </td>
                      <td>{inv.clientLegalName || <span className={styles.muted}>—</span>}</td>
                      <td>{formatDate(inv.invoiceDate)}</td>
                      <td>{formatDate(inv.dueDate)}</td>
                      <td className={styles.amount}>{formatDA(inv.ttc)}</td>
                      <td>
                        <Badge variant={STATUS_BADGE[inv.status] || "neutral"}>
                          {STATUS_LABEL[inv.status] || inv.status}
                        </Badge>
                      </td>
                      <td>
                        <Button variant="primary" size="sm" onClick={() => navigate(`/invoices/${inv.id}`)}>
                          Détails
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.totalPages > 1 && (
              <div className={styles.pagination}>
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => goTo(page - 1)}>
                  ← Précédent
                </Button>
                <span className={styles.pageInfo}>Page {data.page} / {data.totalPages}</span>
                <Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => goTo(page + 1)}>
                  Suivant →
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
