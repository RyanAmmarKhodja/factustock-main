import { useState, useEffect, useCallback } from "react";
import Input from "../../components/ui/Input";
import styles from "./ClientSelectionFormModal.module.css";
import { getClients } from "../../api/clientApi";
import {
  PageHeader,
  Card,
  CardHeader,
  Badge,
  Alert,
} from "../../components/ui/UI";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import SearchBar from "../../components/clients/SearchBar";
import { useNavigate } from "react-router-dom";

const typeLabel = (t) =>
  t === 1 || t === "Company" ? "Entreprise" : "Particulier";
const typeBadge = (t) => (t === 1 || t === "Company" ? "primary" : "neutral");

/**
 * Create / Edit product modal — Fluent Panel pattern.
 *
 * @param {"create"|"edit"} mode
 * @param {object|null}     product   — existing product data (edit only)
 * @param {function}        onClose
 * @param {function}        onSubmit — (formData) => Promise<void>
 */
export default function ClientSelectionFormModal({
  mode = "create",
  product = null,
  initialData,
  onSave,
  onClose,
  onSubmit,
}) {
  const isEdit = mode === "edit";
  const navigate = useNavigate();
  const [localForm, setLocalForm] = useState(initialData);

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [filters, setFilters] = useState({
    search: undefined,
    type: undefined,
    includeArchived: false,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [data, setData] = useState(null);

  const fetchClients = useCallback(async (p, f) => {
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
  }, []);

  const goTo = (p) => {
    setPage(p);
    fetchClients(p, filters);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Fetch once on mount
  useEffect(() => {
    fetchClients(1, { search: undefined, type: undefined, includeArchived: false });
  }, [fetchClients]);

  const handleSelect = (client) => {
    const updatedData = {
    ...localForm,
    clientId: client.id || "",
    legalName: client.legalName || "",
    AI: client.ai || "",
    NIF: client.nif || "",
    RC: client.rc || "",
    address: client.address || "",
  };

    setLocalForm(updatedData);

    setLocalForm ({
      ...localForm,
      address: client.address
    });

    onSave(updatedData); 
  
    onClose();
  };

  // Search / filter callback
  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    fetchClients(1, newFilters);
  };

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal} // Wrap everything inside this div
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-modal-title"
      >
        {/* Optional: Add a Close Button if you have one in your CSS */}
        <div className={styles.modalHeader}>
          <h2 id="client-modal-title" className={styles.modalTitle}>
            Sélectionner un Client
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <PageHeader
            title="Clients"
            subtitle="Gérez votre portefeuille clients."
          />

          <SearchBar onSearch={handleSearch} />

          {error && (
            <Alert variant="danger" onDismiss={() => setError("")}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" onDismiss={() => setSuccess("")}>
              {success}
            </Alert>
          )}

          <Card padding="sm" className={styles.tableCard}>
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
                        <th>Téléphone</th>
                        <th>NIF</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((client) => (
                        <tr key={client.id}>
                          {/* Note: I added a wrapper div inside the td to keep the flex layout for the avatar */}
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
                              <span className={styles.namePrimary}>
                                {client.legalName}
                              </span>
                              {(client.firstName || client.lastName) && (
                                <span className={styles.nameSecondary}>
                                  {[client.firstName, client.lastName]
                                    .filter(Boolean)
                                    .join(" ")}
                                </span>
                              )}
                            </div>
                          </td>

                          <td>
                            {client.tel || (
                              <span className={styles.muted}>—</span>
                            )}
                          </td>
                          <td>
                            {client.nif || (
                              <span className={styles.muted}>—</span>
                            )}
                          </td>

                          <td>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <Button
                                variant="primary"
                                size="md"
                                onClick={() => handleSelect(client)}
                              >
                                Sélectionner
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
                      variant="secondary"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => goTo(page - 1)}
                    >
                      ← Précédent
                    </Button>
                    <span className={styles.pageInfo}>
                      Page {data.page} / {data.totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
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
        </div>
      </div>
    </div>
  );
}
