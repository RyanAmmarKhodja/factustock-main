import { useState, useEffect, useCallback } from "react";
import styles from "./ClientSelectionFormModal.module.css";
import { getProducts } from "../../api/productApi";
import { PageHeader, Card, Alert } from "../../components/ui/UI";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import SearchBar from "../../components/products/SearchBar";

/**
 * Product selection modal.
 * onSave(product) — called when user picks a product.
 */
export default function ProductSelectionFormModal({ onSave, onClose }) {
  const [filters, setFilters] = useState({ search: undefined, includeArchived: false });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({ items: [], totalPages: 1, page: 1 });

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

  useEffect(() => {
    fetchProducts(1, { search: undefined, includeArchived: false });
  }, [fetchProducts]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const goTo = (p) => { setPage(p); fetchProducts(p, filters); };

  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    fetchProducts(1, newFilters);
  };

  const handleSelect = (product) => {
    onSave(product);
    onClose();
  };

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Sélectionner un Produit</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          <SearchBar onSearch={handleSearch} />

          {error && <Alert variant="danger" onDismiss={() => setError("")}>{error}</Alert>}

          <Card padding="sm">
            {loading ? (
              <Loading />
            ) : data.items.length === 0 ? (
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
                        <th>Prix HT</th>
                        <th>TVA</th>
                        <th>Unité</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <div className={styles.nameInfo}>
                              <span className={styles.namePrimary}>{product.name}</span>
                              <span className={styles.nameSecondary}>{product.code}</span>
                            </div>
                          </td>
                          <td>{product.category || <span className={styles.muted}>—</span>}</td>
                          <td>{product.price != null ? `${product.price} DA` : <span className={styles.muted}>—</span>}</td>
                          <td>{product.defaultTaxRate != null ? `${product.defaultTaxRate}%` : <span className={styles.muted}>—</span>}</td>
                          <td>{product.unit || <span className={styles.muted}>—</span>}</td>
                          <td>
                            <Button variant="primary" size="sm" onClick={() => handleSelect(product)}>
                              Sélectionner
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
      </div>
    </div>
  );
}
