import { useState, useEffect } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Alert } from "../ui/UI";
import styles from "./ProductFormModal.module.css";

/**
 * Create / Edit product modal — Fluent Panel pattern.
 *
 * @param {"create"|"edit"} mode
 * @param {object|null}     product   — existing product data (edit only)
 * @param {function}        onClose
 * @param {function}        onSubmit — (formData) => Promise<void>
 */
export default function ProductFormModal({ mode = "create", product = null, onClose, onSubmit }) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    
    Code: product?.Code ?? "",
    Name:  product?.Name  ?? "",
    Description: product?.Description ?? "",
    Category:     product?.Category     ?? "",
    Price:       product?.Price       ?? "",
    Unit:   product?.Unit   ?? "",
    DefaultTaxRate:        product?.DefaultTaxRate        ?? "",
    StockQuantity:        product?.StockQuantity        ?? "",
    MinStockLevel:       product?.MinStockLevel       ?? "",
    Barcode:       product?.Barcode       ?? ""
  });
  

  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

 const validate = () => {
    const errs = {};
    if (!form.Code.trim()) errs.Code = "Le code produit est obligatoire.";
    if (!form.Name.trim()) errs.Name = "Le nom est obligatoire.";
    if (!form.Price || form.Price < 0) errs.Price = "Prix invalide.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        Price: parseFloat(form.Price),
        DefaultTaxRate: parseFloat(form.DefaultTaxRate) || 0,
        StockQuantity: parseFloat(form.StockQuantity) || 0,
        MinStockLevel: parseFloat(form.MinStockLevel) || 0,
      };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || "Une erreur s'est produite.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="product-modal-title">

        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 id="product-modal-title" className={styles.modalTitle}>
            {isEdit ? "Modifier le produit" : "Ajouter un produit"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {apiError && (
            <Alert variant="danger" onDismiss={() => setApiError("")}>{apiError}</Alert>
          )}

          <form onSubmit={handleSubmit} noValidate className={styles.form}>
            {/* Section: Informations Générales */}
            <div className={styles.sectionTitle}>Informations Générales</div>

            <div className={styles.row}>
              <Input
                id="Code" name="Code" label="Code Produit (SKU)"
                value={form.Code} onChange={handleChange}
                error={errors.Code} required autoFocus
              />
              <Input
                id="Barcode" name="Barcode" label="Code-barres"
                value={form.Barcode} onChange={handleChange}
              />
            </div>

            <Input
              id="Name" name="Name" label="Désignation"
              value={form.Name} onChange={handleChange}
              error={errors.Name} required
            />

            <Input
              id="Description" name="Description" label="Description"
              value={form.Description} onChange={handleChange}
            />

            <div className={styles.row}>
              <Input
                id="Category" name="Category" label="Catégorie"
                value={form.Category} onChange={handleChange}
              />
              <Input
                id="Unit" name="Unit" label="Unité (ex: kg, pc)"
                value={form.Unit} onChange={handleChange}
              />
            </div>

            {/* Section: Tarification & Taxes */}
            <div className={styles.sectionTitle}>Tarification & Taxes</div>

            <div className={styles.row}>
              <Input
                id="Price" name="Price" type="number" label="Prix de vente"
                value={form.Price} onChange={handleChange}
                error={errors.Price} required
              />
              <Input
                id="DefaultTaxRate" name="DefaultTaxRate" type="number" label="Taux TVA (%)"
                value={form.DefaultTaxRate} onChange={handleChange}
              />
            </div>

            {/* Section: Stockage */}
            <div className={styles.sectionTitle}>Gestion de Stock</div>

            <div className={styles.row}>
              <Input
                id="StockQuantity" name="StockQuantity" type="number" label="Quantité actuelle"
                value={form.StockQuantity} onChange={handleChange}
                disabled={isEdit} // Often stock is managed via adjustments, not direct edit
              />
              <Input
                id="MinStockLevel" name="MinStockLevel" type="number" label="Seuil d'alerte"
                value={form.MinStockLevel} onChange={handleChange}
              />
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <Button variant="secondary" onClick={onClose} type="button">
                Annuler
              </Button>
              <Button type="submit" loading={loading}>
                {isEdit ? "Enregistrer les modifications" : "Créer le produit"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
