import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import { Alert, PageHeader } from "../../../shared/components/UI";
import styles from "../styles/GenerateInvoice.module.css";
import { createInvoice } from "../../orders/api/documentApi";
import ClientSelectionFormModal from "../components/ClientSelectionFormModal";
import ProductSelectionFormModal from "../components/ProductSelectionFormModal";

const PAYMENT_METHODS = [
  { value: 0, label: "Espèces" },
  { value: 1, label: "Virement bancaire" },
  { value: 2, label: "Chèque" },
  { value: 3, label: "Carte CIB" },
  { value: 4, label: "Carte Edahabia" },
];

const emptyLine = () => ({
  productId: "",
  designation: "",
  quantity: 1,
  unit: "",
  pricePerUnitOverride: "",
  tvaOverride: "",
});

export default function GenerateInvoice() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    clientId: "",
    legalName: "",
    address: "",
    NIF: "",
    AI: "",
    RC: "",
    tel: "",
    email: "",
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    paymentMethod: 0,
    notes: "",
    lines: [emptyLine()],
  });

  const [showClientModal, setShowClientModal] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null); // holds { invoiceNumber, pdfUrl }

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  // Called when user picks a client from the modal
  const handleClientSelected = (updatedForm) => {
    setForm(updatedForm);
    setErrors((prev) => ({ ...prev, legalName: "" }));
  };

  // Open product picker for a specific line
  const openProductPicker = (lineIndex) => {
    setActiveLineIndex(lineIndex);
    setShowProductModal(true);
  };

  // Called when user picks a product from the modal
  const handleProductSelected = (product) => {
    setForm((prev) => {
      const lines = [...prev.lines];
      lines[activeLineIndex] = {
        ...lines[activeLineIndex],
        productId: product.id,
        designation: product.name,
        unit: product.unit || "",
        pricePerUnitOverride: "",
        tvaOverride: "",
      };
      return { ...prev, lines };
    });
    setErrors((prev) => ({ ...prev, [`line_${activeLineIndex}_productId`]: "" }));
  };

  const handleLineChange = (i, e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const lines = [...prev.lines];
      lines[i] = { ...lines[i], [name]: value };
      return { ...prev, lines };
    });
    setErrors((prev) => ({ ...prev, [`line_${i}_quantity`]: "" }));
  };

  const addLine = () => {
    const newIndex = form.lines.length;
    setForm((prev) => ({ ...prev, lines: [...prev.lines, emptyLine()] }));
    openProductPicker(newIndex);
  };

  const removeLine = (i) => {
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, idx) => idx !== i),
    }));
  };

  // ── Validation ───────────────────────────────────────────────────────────────

  const validate = () => {
    const errs = {};
    if (!form.legalName.trim()) errs.legalName = "Le nom du client est obligatoire.";
    if (!form.invoiceDate) errs.invoiceDate = "La date de facture est obligatoire.";
    form.lines.forEach((l, i) => {
      if (!l.productId) errs[`line_${i}_productId`] = "Produit requis.";
      if (!l.quantity || Number(l.quantity) <= 0) errs[`line_${i}_quantity`] = "Qté invalide.";
    });
    return errs;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError("");
    try {
      const payload = {
        clientId: form.clientId ? Number(form.clientId) : null,
        clientLegalName: form.legalName.trim(),
        clientAddress: form.address || null,
        clientTel: form.tel || null,
        clientEmail: form.email || null,
        clientRC: form.RC || null,
        clientNIF: form.NIF || null,
        clientAI: form.AI || null,
        invoiceDate: new Date(form.invoiceDate).toISOString(),
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        paymentMethod: Number(form.paymentMethod),
        notes: form.notes.trim() || null,
        lines: form.lines.map((l) => ({
          productId: Number(l.productId),
          quantity: Number(l.quantity),
          pricePerUnitOverride: l.pricePerUnitOverride !== "" ? Number(l.pricePerUnitOverride) : null,
          tvaOverride: l.tvaOverride !== "" ? Number(l.tvaOverride) : null,
        })),
      };

      const res = await createInvoice(payload);
      const { invoiceNumber, pdfDownloadUrl } = res.data;

      setSuccess({ invoiceNumber, pdfDownloadUrl });
    } catch (err) {
      setApiError(err.response?.data?.message || "Une erreur s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000";
    window.open(apiBase + success.pdfDownloadUrl, "_blank");
  };

  // ── Success state ─────────────────────────────────────────────────────────────

  if (success) {
    return (
      <div>
        <PageHeader
          title="Facture créée"
          subtitle={`Facture N° ${success.invoiceNumber} générée avec succès.`}
        />
        <div className={styles.successBox}>
          <p className={styles.successText}>
            La facture <strong>{success.invoiceNumber}</strong> a été enregistrée.
          </p>
          <div className={styles.successActions}>
            <Button onClick={handleDownloadPdf}>Télécharger le PDF</Button>
            <Button variant="secondary" onClick={() => navigate("/invoices")}>
              Voir les factures
            </Button>
            <Button variant="ghost" onClick={() => { setSuccess(null); setForm({ clientId: "", legalName: "", address: "", NIF: "", AI: "", RC: "", tel: "", email: "", invoiceDate: new Date().toISOString().slice(0, 10), dueDate: "", paymentMethod: 0, notes: "", lines: [emptyLine()] }); }}>
              Nouvelle facture
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title="Créer une facture"
        subtitle="Remplissez les informations ci-dessous pour générer une facture."
        action={
          <Button variant="secondary" onClick={() => navigate("/invoices")}>
            ← Retour aux factures
          </Button>
        }
      />

      {apiError && (
        <Alert variant="danger" onDismiss={() => setApiError("")}>{apiError}</Alert>
      )}

      <form onSubmit={handleSubmit} noValidate>

        {/* ── Client ─────────────────────────────────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            Client
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowClientModal(true)}
              style={{ marginLeft: "1rem" }}
            >
              Choisir depuis la liste
            </Button>
          </div>

          {form.clientId && (
            <p className={styles.clientBadge}>Client lié : ID #{form.clientId}</p>
          )}

          <div className={styles.row}>
            <Input
              name="legalName"
              label="Nom légal / Raison sociale *"
              placeholder="Ex: SARL Benali Commerce"
              value={form.legalName}
              onChange={handleChange}
              error={errors.legalName}
            />
            <Input
              name="NIF"
              label="NIF"
              placeholder="Numéro d'identification fiscale"
              value={form.NIF}
              onChange={handleChange}
            />
          </div>
          <div className={styles.row}>
            <Input
              name="AI"
              label="Article d'imposition"
              placeholder="AI"
              value={form.AI}
              onChange={handleChange}
            />
            <Input
              name="RC"
              label="Registre de commerce"
              placeholder="RC"
              value={form.RC}
              onChange={handleChange}
            />
          </div>
          <div className={styles.row}>
            <Input
              name="tel"
              label="Téléphone"
              placeholder="Téléphone"
              value={form.tel}
              onChange={handleChange}
            />
            <Input
              name="email"
              label="E-mail"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <Input
            name="address"
            label="Adresse"
            placeholder="Adresse complète"
            value={form.address}
            onChange={handleChange}
          />
        </div>

        {/* ── Infos générales ──────────────────────────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Informations générales</div>
          <div className={styles.row}>
            <Input
              name="invoiceDate"
              label="Date de facture *"
              type="date"
              value={form.invoiceDate}
              onChange={handleChange}
              error={errors.invoiceDate}
            />
            <Input
              name="dueDate"
              label="Date d'échéance"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Mode de paiement</label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className={styles.select}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Lignes de facture ─────────────────────────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            Lignes de facture
            <button type="button" className={styles.addLineBtn} onClick={addLine}>
              + Ajouter une ligne
            </button>
          </div>

          {form.lines.map((line, i) => (
            <div key={i} className={styles.lineBlock}>
              <div className={styles.lineHeader}>
                <span className={styles.lineLabel}>
                  {line.designation ? `${i + 1}. ${line.designation}` : `Ligne ${i + 1}`}
                </span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    className={styles.addLineBtn}
                    onClick={() => openProductPicker(i)}
                  >
                    {line.productId ? "Changer le produit" : "Choisir un produit"}
                  </button>
                  {form.lines.length > 1 && (
                    <button type="button" className={styles.removeLineBtn} onClick={() => removeLine(i)}>
                      Supprimer
                    </button>
                  )}
                </div>
              </div>

              {errors[`line_${i}_productId`] && (
                <p className={styles.fieldError}>{errors[`line_${i}_productId`]}</p>
              )}

              <div className={styles.row}>
                <Input
                  label={line.unit ? `Quantité (${line.unit})` : "Quantité *"}
                  name="quantity"
                  type="number"
                  min="0.001"
                  step="any"
                  value={line.quantity}
                  onChange={(e) => handleLineChange(i, e)}
                  error={errors[`line_${i}_quantity`]}
                />
                <Input
                  label="Prix unitaire HT (optionnel)"
                  name="pricePerUnitOverride"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Laisser vide = prix catalogue"
                  value={line.pricePerUnitOverride}
                  onChange={(e) => handleLineChange(i, e)}
                />
                <Input
                  label="TVA % (optionnel)"
                  name="tvaOverride"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="Laisser vide = TVA produit"
                  value={line.tvaOverride}
                  onChange={(e) => handleLineChange(i, e)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Notes ────────────────────────────────────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Notes</div>
          <textarea
            name="notes"
            className={styles.textarea}
            rows={3}
            placeholder="Remarques, conditions, etc."
            value={form.notes}
            onChange={handleChange}
          />
        </div>

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <div className={styles.actions}>
          <Button variant="secondary" type="button" onClick={() => navigate("/invoices")}>
            Annuler
          </Button>
          <Button type="submit" loading={loading}>
            Créer la facture
          </Button>
        </div>

      </form>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      {showClientModal && (
        <ClientSelectionFormModal
          initialData={form}
          onSave={handleClientSelected}
          onClose={() => setShowClientModal(false)}
        />
      )}

      {showProductModal && (
        <ProductSelectionFormModal
          onSave={handleProductSelected}
          onClose={() => setShowProductModal(false)}
        />
      )}
    </div>
  );
}
