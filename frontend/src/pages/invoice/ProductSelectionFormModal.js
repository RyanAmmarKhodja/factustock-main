import { useState, useEffect, useCallback } from "react";
import styles from "./ClientSelectionFormModal.module.css";
import { getProducts } from "../../api/productApi";
import { PageHeader, Card, Alert } from "../../components/ui/UI";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import SearchBar from "../../components/products/SearchBar";

/**
 * Selection product modal — Fluent Panel pattern.
 *
 * @param {object}           initialData
 * @param {function}         onSave
 * @param {function}         onClose
 */
export default function ProductSelectionFormModal({
  initialData,
  onSave,
  onClose,
}) {
  const [filters, setFilters] = useState({
    search: undefined,
    type: undefined,
    includeArchived: false,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({ items: [], totalPages: 1, page: 1 });
  const [form, setForm] = useState(initialData);

  const fetchProducts = useCallback(async (p, f) => {
    setLoading(true);
    setError("");
    try {
      const res = await getProducts({ ...f, page: p, pageSize: 20 });
      setData(res.data || { items: [], totalPages: 1, page: 1 });
    } catch {
      setError("Impossible de charger la liste des produits.");
    } finally {
      setLoading(false);
    }
  }, []);

  const goTo = (p) => {
    setPage(p);
    fetchProducts(p, filters);
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
    fetchProducts(1, {
      search: undefined,
      type: undefined,
      includeArchived: false,
    });
  }, [fetchProducts]);

  const handleSelect = (product) => {
    const updatedLines = [...prevForm.lines];

    updatedLines.push({
      productId: product.id || "",
      designation: product.name || "",
      quantity: 1,
      unitOverride: "",
      pricePerUnitOverride: product.price || "",
      tvaOverride: "",
      priceHorsTaxe: "",
      priceTTC: "",
    });

    onClose();
  };

  // Search / filter callback
  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    fetchProducts(1, newFilters);
  };

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <div className={styles.modalHeader}>
          <h2 id="product-modal-title" className={styles.modalTitle}>
            Sélectionner un Produit
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <PageHeader
            title="Produits"
            subtitle="Gérez votre portefeuille produits."
          />

          <SearchBar onSearch={handleSearch} />

          {error && (
            <Alert variant="danger" onDismiss={() => setError("")}>
              {error}
            </Alert>
          )}

          <Card padding="sm" className={styles.tableCard}>
            {loading ? (
              <Loading />
            ) : !data?.items || data.items.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>📦</span>
                <p>Aucun produit trouvé.</p>
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
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((product) => (
                        <tr key={product.id}>
                          <td>
                            {product.name || (
                              <span className={styles.muted}>—</span>
                            )}
                          </td>
                          <td>
                            {product.category || (
                              <span className={styles.muted}>—</span>
                            )}
                          </td>
                          <td>
                            {product.price !== undefined &&
                            product.price !== null ? (
                              `${product.price}`
                            ) : (
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
                                onClick={() => handleSelect(product)}
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
