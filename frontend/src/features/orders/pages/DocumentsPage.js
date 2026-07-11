import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getBons } from "../api/bonApi";
import { PageHeader, Card, CardHeader, Badge, Alert } from "../../../shared/components/UI";
import Button from "../../../shared/components/Button";
import Loading from "../../../shared/components/Loading";
import styles from "../styles/DocumentsPage.module.css";

const BON_TYPES = [
  { value: "",              label: "Tous les types" },
  { value: "BonLivraison",  label: "Bon de Livraison" },
  { value: "BonReception",  label: "Bon de Réception" },
  { value: "BonCommande",   label: "Bon de Commande" },
];

const typeLabel = (t) => {
  if (t === "BonLivraison") return "Bon de Livraison";
  if (t === "BonReception") return "Bon de Réception";
  if (t === "BonCommande")  return "Bon de Commande";
  return t;
};

const typeBadge = (t) => {
  if (t === "BonLivraison") return "primary";
  if (t === "BonReception") return "success";
  if (t === "BonCommande")  return "neutral";
  return "neutral";
};

export default function DocumentsPage() {
  const navigate = useNavigate();

  const [data, setData]       = useState({ items: [], totalCount: 0, page: 1, totalPages: 0 });
  const [search, setSearch]   = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchBons = useCallback(async (p, s, t) => {
    setLoading(true);
    setError("");
    try {
      const res = await getBons({ search: s || undefined, type: t || undefined, page: p, pageSize: 20 });
      setData(res.data);
    } catch {
      setError("Impossible de charger les documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBons(1, "", ""); }, [fetchBons]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    fetchBons(1, val, typeFilter);
  };

  const handleTypeFilter = (e) => {
    const val = e.target.value;
    setTypeFilter(val);
    setPage(1);
    fetchBons(1, search, val);
  };

  const goTo = (p) => {
    setPage(p);
    fetchBons(p, search, typeFilter);
  };

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle="Consultez et téléchargez tous vos bons."
        action={
          <Button onClick={() => navigate("/documents/create")}>
            + Créer un bon
          </Button>
        }
      />

      {error && <Alert variant="danger" onDismiss={() => setError("")}>{error}</Alert>}

      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={styles.searchInput}
          placeholder="Rechercher par N° ou client…"
          value={search}
          onChange={handleSearch}
        />
        <select className={styles.typeSelect} value={typeFilter} onChange={handleTypeFilter}>
          {BON_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <Card padding="sm" className={styles.tableCard}>
        <CardHeader
          title="Tous les bons"
          subtitle={`${data.totalCount} document${data.totalCount !== 1 ? "s" : ""}`}
        />

        {loading ? (
          <Loading />
        ) : data.items.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📄</span>
            <p>Aucun document trouvé.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>N° Bon</th>
                    <th>Type</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Total HT</th>
                    <th>Total TTC</th>
                    <th>Créé par</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((bon) => (
                    <tr key={bon.id}>
                      <td className={styles.numberCell}>{bon.bonNumber}</td>
                      <td><Badge variant={typeBadge(bon.bonType)}>{typeLabel(bon.bonType)}</Badge></td>
                      <td>{bon.clientLegalName || <span className={styles.muted}>—</span>}</td>
                      <td>{new Date(bon.bonDate).toLocaleDateString("fr-DZ")}</td>
                      <td>{bon.totalHorsTaxe.toLocaleString("fr-DZ", { minimumFractionDigits: 2 })} DA</td>
                      <td className={styles.ttcCell}>{bon.ttc.toLocaleString("fr-DZ", { minimumFractionDigits: 2 })} DA</td>
                      <td>{bon.createdByUser}</td>
                      <td>
                        <div className={styles.actions}>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/documents/${bon.id}`)}>
                            Détails
                          </Button>
                        </div>
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
