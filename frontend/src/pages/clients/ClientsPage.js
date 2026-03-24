import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getClients, createClient } from "../../api/clientApi";
import { PageHeader, Card, CardHeader, Badge, Alert } from "../../components/ui/UI";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import SearchBar from "../../components/clients/SearchBar";
import ClientFormModal from "../../components/clients/ClientFormModal";
import styles from "./ClientsPage.module.css";

const typeLabel = (t) => (t === 1 || t === "Company") ? "Entreprise" : "Particulier";
const typeBadge = (t) => (t === 1 || t === "Company") ? "primary" : "neutral";

export default function ClientsPage() {
  const navigate = useNavigate();

  const [data, setData]           = useState({ items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 });
  const [filters, setFilters]     = useState({ search: undefined, type: undefined, includeArchived: false });
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const fetchClients = useCallback(async (p = page, f = filters) => {
    setLoading(true);
    setError("");
    try {
      const res = await getClients({ ...f, page: p, pageSize: 20 });
      setData(res.data);
    } catch {
      setError("Impossible de charger la liste des clients.");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  // Search / filter callback
  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    fetchClients(1, newFilters);
  };

  // Create
  const handleCreate = async (formData) => {
    await createClient(formData);
    setSuccess("Client créé avec succès.");
    fetchClients();
  };

  // Pagination
  const goTo = (p) => { setPage(p); fetchClients(p, filters); };

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle="Gérez votre portefeuille clients."
        action={
          <Button onClick={() => setShowCreate(true)}>
            + Ajouter un client
          </Button>
        }
      />

      <SearchBar onSearch={handleSearch} />

      {error   && <Alert variant="danger"  onDismiss={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success" onDismiss={() => setSuccess("")}>{success}</Alert>}

      <Card padding="sm" className={styles.tableCard}>
        <CardHeader
          title="Liste des clients"
          subtitle={`${data.totalCount} client${data.totalCount !== 1 ? "s" : ""} trouvé${data.totalCount !== 1 ? "s" : ""}`}
        />

        {loading ? (
          <Loading />
        ) : data.items.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>👤</span>
            <p>Aucun client trouvé.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Type</th>
                    <th>Téléphone</th>
                    <th>E-mail</th>
                    <th>NIF</th>
                    <th>Factures</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((client) => (
                    <tr key={client.id}>
                      <td
                        className={styles.nameCell}
                        onClick={() => navigate(`/clients/${client.id}`)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className={styles.avatar}>
                          {(client.legalName || "?")[0]}
                        </div>
                        <div className={styles.nameInfo}>
                          <span className={styles.namePrimary}>{client.legalName}</span>
                          {(client.firstName || client.lastName) && (
                            <span className={styles.nameSecondary}>
                              {[client.firstName, client.lastName].filter(Boolean).join(" ")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td><Badge variant={typeBadge(client.type)}>{typeLabel(client.type)}</Badge></td>
                      <td>{client.tel || <span className={styles.muted}>—</span>}</td>
                      <td>{client.email || <span className={styles.muted}>—</span>}</td>
                      <td>{client.nif || <span className={styles.muted}>—</span>}</td>
                      <td className={styles.centered}>{client.totalInvoices}</td>
                      <td>
                        {client.isArchived
                          ? <Badge variant="warning">Archivé</Badge>
                          : <Badge variant="success">Actif</Badge>
                        }
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/clients/${client.id}`)}>
                            Détails
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/clients/${client.id}/stats`)}>
                            Stats
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/clients/${client.id}/invoices`)}>
                            Factures
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className={styles.pagination}>
                <Button
                  variant="secondary" size="sm"
                  disabled={page <= 1}
                  onClick={() => goTo(page - 1)}
                >
                  ← Précédent
                </Button>
                <span className={styles.pageInfo}>
                  Page {data.page} / {data.totalPages}
                </span>
                <Button
                  variant="secondary" size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => goTo(page + 1)}
                >
                  Suivant →
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Create modal */}
      {showCreate && (
        <ClientFormModal
          mode="create"
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}
