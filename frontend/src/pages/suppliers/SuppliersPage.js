import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getSuppliers, createSupplier } from "../../api/supplierApi";
import { PageHeader, Card, CardHeader, Badge, Alert } from "../../components/ui/UI";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import SearchBar from "../../components/suppliers/SearchBar";
import SupplierFormModal from "../../components/suppliers/SupplierFormModal";
import styles from "./SuppliersPage.module.css";

const typeLabel = (t) => (t === 1 || t === "Company") ? "Entreprise" : "Particulier";
const typeBadge = (t) => (t === 1 || t === "Company") ? "primary" : "neutral";

export default function SuppliersPage() {
  const navigate = useNavigate();

  const [data, setData]           = useState({ items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0 });
  const [filters, setFilters]     = useState({ search: undefined, type: undefined, includeArchived: false });
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const fetchSuppliers = useCallback(async (p = page, f = filters) => {
    setLoading(true);
    setError("");
    try {
      const res = await getSuppliers({ ...f, page: p, pageSize: 20 });
      setData(res.data);
    } catch {
      setError("Impossible de charger la liste des suppliers.");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  // Search / filter callback
  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    fetchSuppliers(1, newFilters);
  };

  // Create
  const handleCreate = async (formData) => {
    await createSupplier(formData);
    setSuccess("Supplier créé avec succès.");
    fetchSuppliers();
  };

  // Pagination
  const goTo = (p) => { setPage(p); fetchSuppliers(p, filters); };

  return (
    <div>
      <PageHeader
        title="Suppliers"
        subtitle="Gérez votre portefeuille suppliers."
        action={
          <Button size="lg" onClick={() => setShowCreate(true)}>
            + Ajouter un supplier
          </Button>
        }
      />

      <SearchBar onSearch={handleSearch} />

      {error   && <Alert variant="danger"  onDismiss={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success" onDismiss={() => setSuccess("")}>{success}</Alert>}

      <Card padding="sm" className={styles.tableCard}>
        <div style={{display:"flex", flexDirection:"row",alignItems:"center",gap:"2em"}}>
          <CardHeader
          title="Liste des suppliers"
          subtitle={`${data.totalCount} supplier${data.totalCount !== 1 ? "s" : ""} trouvé${data.totalCount !== 1 ? "s" : ""}`}
            />
        <Button size="lg" onClick={() => setShowCreate(true)}>
            + Ajouter un supplier
          </Button>
        </div>
        
        {loading ? (
          <Loading />
        ) : data.items.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>👤</span>
            <p>Aucun supplier trouvé.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Supplier</th>
                    {/* <th>Type</th> */}
                    <th>Téléphone</th>
                    <th>E-mail</th>
                    <th>NIF</th>
                    {/* <th>Factures</th> */}
                    {/* <th>Statut</th> */}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((supplier) => (
                    <tr key={supplier.id}>
                      <td
                        className={styles.nameCell}
                        onClick={() => navigate(`/suppliers/${supplier.id}`)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className={styles.avatar}>
                          {(supplier.legalName || "?")[0]}
                        </div>
                        <div className={styles.nameInfo}>
                          <span className={styles.namePrimary}>{supplier.legalName}</span>
                          {(supplier.firstName || supplier.lastName) && (
                            <span className={styles.nameSecondary}>
                              {[supplier.firstName, supplier.lastName].filter(Boolean).join(" ")}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* <td><Badge variant={typeBadge(supplier.type)}>{typeLabel(supplier.type)}</Badge></td> */}
                      <td>{supplier.tel || <span className={styles.muted}>—</span>}</td>
                      <td>{supplier.email || <span className={styles.muted}>—</span>}</td>
                      <td>{supplier.nif || <span className={styles.muted}>—</span>}</td>
                      {/* <td className={styles.centered}>{supplier.totalInvoices}</td> */}
                      {/* <td>
                        {supplier.isArchived
                          ? <Badge variant="warning">Archivé</Badge>
                          : <Badge variant="success">Actif</Badge>
                        }
                      </td> */}
                      <td>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <Button  variant="primary" size="md" onClick={() => navigate(`/suppliers/${supplier.id}`)}>
                            Détails
                          </Button>
                          {/* <Button variant="ghost" size="sm" onClick={() => navigate(`/suppliers/${supplier.id}/stats`)}>
                            Stats
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/suppliers/${supplier.id}/invoices`)}>
                            Factures
                          </Button> */}
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
        <SupplierFormModal
          mode="create"
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}
