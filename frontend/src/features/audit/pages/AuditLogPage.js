import { useState, useEffect, useCallback } from "react";
import { getLogs } from "../api/logsApi";
import { PageHeader, Card, CardHeader, Alert } from "../../../shared/components/UI";
import Button from "../../../shared/components/Button";
import Loading from "../../../shared/components/Loading";
import styles from "../styles/AuditLogPage.module.css";

const ACTION_LABEL = {
  Generated: "Facture générée",
  Create:    "Création",
  Update:    "Modification",
  Delete:    "Suppression",
  Login:     "Connexion",
};

const ACTION_COLOR = {
  Generated: "var(--color-primary)",
  Create:    "var(--color-success)",
  Update:    "#d97706",
  Delete:    "var(--color-danger)",
  Login:     "var(--color-text-secondary)",
};

const ENTITY_ICON = {
  Invoice:  "",
  Client:   "",
  Supplier: "",
  Product:  "",
  User:     "",
};

const formatDate = (d) =>
  new Date(d).toLocaleString("fr-DZ", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

export default function AuditLogPage() {
  const [data, setData]       = useState({ items: [], totalCount: 0, page: 1, pageSize: 50, totalPages: 0 });
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchLogs = useCallback(async (p = 1, s = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await getLogs({ search: s || undefined, page: p, pageSize: 50 });
      setData(res.data);
    } catch {
      setError("Impossible de charger le journal d'activités.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(1, ""); }, [fetchLogs]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    fetchLogs(1, val);
  };

  const goTo = (p) => { setPage(p); fetchLogs(p, search); };

  return (
    <div>
      <PageHeader
        title="Journal d'activités"
        subtitle="Historique de toutes les actions effectuées dans l'application."
      />

      <div className={styles.searchRow}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Rechercher par action, entité..."
          value={search}
          onChange={handleSearch}
        />
      </div>

      {error && <Alert variant="danger" onDismiss={() => setError("")}>{error}</Alert>}

      <Card padding="sm">
        <CardHeader
          title="Activités"
          subtitle={`${data.totalCount} entrée${data.totalCount !== 1 ? "s" : ""}`}
        />

        {loading ? (
          <Loading />
        ) : data.items.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📋</span>
            <p>Aucune activité enregistrée.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date & Heure</th>
                    <th>Utilisateur</th>
                    <th>Action</th>
                    <th>Entité</th>
                    <th>Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((log) => (
                    <tr key={log.id}>
                      <td className={styles.dateCell}>{formatDate(log.createdAt)}</td>
                      <td className={styles.userCell}>{log.userFullName}</td>
                      <td>
                        <span
                          className={styles.actionBadge}
                          style={{ color: ACTION_COLOR[log.action] || "var(--color-text)" }}
                        >
                          {ACTION_LABEL[log.action] || log.action}
                        </span>
                      </td>
                      <td>
                        <span className={styles.entityCell}>
                          <span>{ENTITY_ICON[log.entityType] || "📄"}</span>
                          <span>{log.entityType} #{log.entityId}</span>
                        </span>
                      </td>
                      <td className={styles.detailsCell}>
                        {log.details || <span className={styles.muted}>—</span>}
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
