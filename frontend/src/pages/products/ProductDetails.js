import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProduct, updateProduct, archiveProduct, restoreProduct } from "../../api/productApi";
import { PageHeader, Card, Badge, Alert } from "../../components/ui/UI";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ProductFormModal from "../../components/products/ProductFormModal";
import styles from "./ProductDetails.module.css";

const typeLabel = (t) => (t === 1 || t === "Company") ? "Entreprise" : "Particulier";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [showEdit, setShowEdit]     = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // "archive" | "restore" | null

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getProduct(id);
      setProduct(res.data);
    } catch {
      setError("Product introuvable.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  // Edit
  const handleEdit = async (formData) => {
    await updateProduct(id, formData);
    setSuccess("Product mis à jour avec succès.");
    fetchProduct();
  };

  // Archive / Restore
  const handleArchiveRestore = async () => {
    try {
      if (confirmAction === "archive") {
        await archiveProduct(id);
        setSuccess("Product archivé avec succès.");
      } else {
        await restoreProduct(id);
        setSuccess("Product restauré avec succès.");
      }
      setConfirmAction(null);
      fetchProduct();
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur s'est produite.");
      setConfirmAction(null);
    }
  };

  if (loading) return <Loading />;
  if (error && !product) {
    return (
      <div>
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" size="md" onClick={() => navigate("/products")} style={{ marginTop: 16 }}>
          ← Retour aux products
        </Button>
      </div>
    );
  }
  if (!product) return null;

  const infoFields = [
    { label: "Code Produit", value: product.code },
    { label: "Code-barres", value: product.barcode },
    { label: "Désignation", value: product.name },
    { label: "Catégorie", value: product.category },
    { label: "Description", value: product.description },
    { label: "Prix de vente", value: product.price?.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' }) },
    { label: "Unité", value: product.unit },
    { label: "Taux TVA par défaut", value: product.defaultTaxRate ? `${product.defaultTaxRate}%` : "0%" },
    { label: "Quantité en stock", value: product.stockQuantity },
    { label: "Seuil d'alerte", value: product.minStockLevel },
    { 
      label: "Créé le", 
      value: new Date(product.createdAt).toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit", year: "numeric" }) 
    },
  ];

  return (
    <div>
      <PageHeader
        title={product.name}
        subtitle={
          <span className={styles.subtitleRow}>
            Code: {product.code}
            {!product.active && <Badge variant="warning">Archivé</Badge>}
            {product.lowStock && <Badge variant="danger">Stock Faible</Badge>}
          </span>
        }
        action={
          <Button variant="primary" size="md" onClick={() => navigate("/products")}>
            ← Retour aux produits
          </Button>
        }
      />

      {error   && <Alert variant="danger"  onDismiss={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success" onDismiss={() => setSuccess("")}>{success}</Alert>}

      {/* Action buttons */}
      <div className={styles.actionBar}>
        <Button onClick={() => setShowEdit(true)}>
          Modifier
        </Button>
        <Button
          variant={!product.active ? "primary" : "danger"}
          onClick={() => setConfirmAction(!product.active ? "restore" : "archive")}
        >
          {!product.active ? "Restaurer" : "Archiver"}
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/products/${id}/stock-history`)}>
          Historique de stock
        </Button>
      </div>

      {/* Product info */}
      <Card padding="md" className={styles.infoCard}>
        <div className={styles.infoGrid}>
          {infoFields.map((field) => (
            <div key={field.label} className={styles.infoItem}>
              <span className={styles.infoLabel}>{field.label}</span>
              <span className={styles.infoValue}>
                {field.value !== null && field.value !== undefined && field.value !== "" 
                  ? field.value 
                  : <span className={styles.muted}>—</span>}
              </span>
            </div>
          ))}
        </div>

        {!product.active && (
          <div className={styles.archivedBanner}>
            <span>⚠</span>
            <span>
              Ce produit est actuellement archivé et ne figurera pas dans les listes de vente actives.
            </span>
          </div>
        )}
      </Card>

      {/* Edit modal */}
      {showEdit && (
        <ProductFormModal
          mode="edit"
          product={product}
          onClose={() => setShowEdit(false)}
          onSubmit={handleEdit}
        />
      )}

      {/* Confirm dialog */}
      {confirmAction && (
        <ConfirmDialog
          title={confirmAction === "archive" ? "Archiver le produit ?" : "Restaurer le produit ?"}
          message={
            confirmAction === "archive"
              ? <span>Vous êtes sur le point d'archiver <strong>{product.name}</strong>. Il ne sera plus disponible pour de nouvelles transactions.</span>
              : <span>Vous êtes sur le point de restaurer <strong>{product.name}</strong>. Le produit sera de nouveau disponible dans le catalogue.</span>
          }
          confirmLabel={confirmAction === "archive" ? "Oui, archiver" : "Oui, restaurer"}
          variant={confirmAction === "archive" ? "danger" : "primary"}
          onConfirm={handleArchiveRestore}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  )};
