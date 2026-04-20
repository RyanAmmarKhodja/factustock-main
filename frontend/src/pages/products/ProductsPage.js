import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts, createProduct } from "../../api/productApi";
import {
  PageHeader,
  Card,
  CardHeader,
  Badge,
  Alert,
} from "../../components/ui/UI";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import SearchBar from "../../components/products/SearchBar";
import ProductFormModal from "../../components/products/ProductFormModal";
import styles from "./ProductsPage.module.css";

const typeLabel = (t) =>
  t === 1 || t === "Company" ? "Entreprise" : "Particulier";
const typeBadge = (t) => (t === 1 || t === "Company" ? "primary" : "neutral");

export default function ProductsPage() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  });
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

  const fetchProducts = useCallback(
    async (p = page, f = filters) => {
      setLoading(true);
      setError("");
      try {
        const res = await getProducts({ ...f, page: p, pageSize: 20 });
        setData(res.data);
      } catch {
        setError("Impossible de charger la liste des products.");
      } finally {
        setLoading(false);
      }
    },
    [page, filters],
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Search / filter callback
  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    fetchProducts(1, newFilters);
  };

  // Create
  const handleCreate = async (formData) => {
    await createProduct(formData);
    setSuccess("Product créé avec succès.");
    fetchProducts();
  };

  // Pagination
  const goTo = (p) => {
    setPage(p);
    fetchProducts(p, filters);
  };

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Gérez votre portefeuille products."
        action={
          <Button size="lg" onClick={() => setShowCreate(true)}>
            + Ajouter un product
          </Button>
        }
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
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "2em",
          }}
        >
          <CardHeader
            title="Liste des products"
            subtitle={`${data.totalCount} product${data.totalCount !== 1 ? "s" : ""} trouvé${data.totalCount !== 1 ? "s" : ""}`}
          />
          <Button size="lg" onClick={() => setShowCreate(true)}>
            + Ajouter un product
          </Button>
        </div>

        {loading ? (
          <Loading />
        ) : data.items.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>👤</span>
            <p>Aucun product trouvé.</p>
          </div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Catégorie</th>
                    <th>Prix</th>
                    <th>Stock</th>
                    <th>Unité</th>
                    <th>Statut</th>
                    <th className={styles.centered}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((product) => (
                    <tr key={product.id}>
                      <td
                        className={styles.nameCell}
                        onClick={() => navigate(`/products/${product.id}`)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className={styles.avatar}>
                          {(product.name || "?")[0]}
                        </div>
                        <div className={styles.nameInfo}>
                          <span className={styles.namePrimary}>
                            {product.name}
                          </span>
                          <span className={styles.nameSecondary}>
                            {product.code}
                          </span>
                        </div>
                      </td>
                      <td>
                        {product.category || (
                          <span className={styles.muted}>Général</span>
                        )}
                      </td>
                      <td>
                        {product.price.toLocaleString("fr-DZ", {
                          style: "currency",
                          currency: "DZD",
                        })}
                      </td>
                      <td>
                        <div className={styles.nameInfo}>
                          <span
                            className={product.lowStock ? styles.danger : ""}
                          >
                            {product.stockQuantity}
                          </span>
                          {product.lowStock && (
                            <span
                              className={styles.nameSecondary}
                              style={{ color: "var(--danger)" }}
                            >
                              Stock faible (min: {product.minStockLevel})
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {product.unit || (
                          <span className={styles.muted}>—</span>
                        )}
                      </td>
                      <td>
                        {product.active ? (
                          <Badge variant="success">Actif</Badge>
                        ) : (
                          <Badge variant="warning">Inactif / Archivé</Badge>
                        )}
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                        >
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => navigate(`/products/${product.id}`)}
                          >
                            Détails
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

      {/* Create modal */}
      {showCreate && (
        <ProductFormModal
          mode="create"
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}
