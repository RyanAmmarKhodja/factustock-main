import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Alert, PageHeader } from "../../components/ui/UI";
import styles from "./GenerateBon.module.css";
import { createBon } from "../../api/bonApi";
import ClientSelectionFormModal from "../invoice/ClientSelectionFormModal";
import ProductSelectionFormModal from "../invoice/ProductSelectionFormModal";

const BON_TYPES = [
  { value: 0, label: "Bon de Livraison (BL)" },
  { value: 1, label: "Bon de Réception (BR)" },
  { value: 2, label: "Bon de Commande (BC)"  },
];

const emptyLine = () => ({
  productId: "",
  designation: "",
  quantity: 1,
  unit: "",
  pricePerUnitOverride: "",
  tvaOverride: "",
});

export default function GenerateBon() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    bonType: 0,
    clientId: "",
    legalName: "",
    address: "",
    NIF: "",
    AI: "",
    RC: "",
    NIS: "",
    tel: "",
    bonDate: new Date().toISOString().slice(0, 10),
    notes: "",
    lines: [emptyLine()],
  });

  const [showClientModal, setShowClientModal]   = useState(false);
  const [activeLineIndex, setActiveLineIndex]   = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const handleClientSelected = (updatedForm) => {
    setForm(updatedForm);
    setErrors((prev) => ({ ...prev, legalName: "" }));
  };

  const openProductPicker = (lineIndex) => {
    setActiveLineIndex(lineIndex);
    setShowProductModal(true);
  };

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
  };

  const addLine = () => {
    const newIndex = form.lines.length;
    setForm((prev) => ({ ...prev, lines: [...prev.lines, emptyLine()] }));
    openProductPicker(newIndex);
  };

  const removeLine = (i) => {
    setForm((prev) => ({ ...prev, lines: prev.lines.filter((_, idx) => idx !== i) }));
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = () => {
    const errs = {};
    if (!form.legalName.trim()) errs.legalName = "Le nom du client est obligatoire.";
    if (!form.bonDate)          errs.bonDate   = "La date est obligatoire.";
    form.lines.forEach((l, i) => {
      if (!l.productId)                           errs[`line_${i}_productId`] = "Produit requis.";
      if (!l.quantity || Number(l.quantity) <= 0) errs[`line_${i}_quantity`]  = "Qté invalide.";
    });
    return errs;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError("");
    try {
      const payload = {
        bonType:         Number(form.bonType),
        clientId:        form.clientId ? Number(form.clientId) : null,
        clientLegalName: form.legalName.trim(),
        clientAddress:   form.address  || null,
        clientTel:       form.tel      || null,
        clientNIF:       form.NIF      || null,
        clientAI:        form.AI       || null,
        clientRC:        form.RC       || null,
        clientNIS:       form.NIS      || null,
        bonDate:         new Date(form.bonDate).toISOString(),
        notes:           form.notes.trim() || null,
        lines: form.lines.map((l) => ({
          productId:            Number(l.productId),
          quantity:             Number(l.quantity),
          pricePerUnitOverride: l.pricePerUnitOverride !== "" ? Number(l.pricePerUnitOverride) : null,
          tvaOverride:          l.tvaOverride          !== "" ? Number(l.tvaOverride)          : null,
        })),
      };

      const res = await createBon(payload);
      setSuccess(res.data);
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

  const resetForm = () => {
    setSuccess(null);
    setForm({
      bonType: 0, clientId: "", legalName: "", address: "",
      NIF: "", AI: "", RC: "", NIS: "", tel: "",
      bonDate: new Date().toISOString().slice(0, 10),
      notes: "", lines: [emptyLine()],
    });
  };

  // ── Success state ──────────────────────────────────────────────────────────

  if (success) {
    return (
      <div>
        <PageHeader title="Bon créé" subtitle={`Bon N° ${success.bonNumber} généré avec succès.`} />
        <div className={styles.successBox}>
          <p className={styles.successText}>
            Le bon <strong>{success.bonNumber}</strong> a été enregistré.
          </p>
          <div className={styles.successActions}>
            <Button onClick={handleDownloadPdf}>Télécharger le PDF</Button>
            <Button variant="secondary" onClick={() => navigate("/documents")}>Voir les documents</Button>
            <Button variant="ghost" onClick={resetForm}>Nouveau bon</Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader
        title="Créer un bon"
        subtitle="Bon de livraison, réception ou commande."
        action={
          <Button variant="secondary" onClick={() => navigate("/documents")}>
            ← Retour aux documents
          </Button>
        }
      />

      {apiError && <Alert variant="danger" onDismiss={() => setApiError("")}>{apiError}</Alert>}

      <form onSubmit={handleSubmit} noValidate>

        {/* ── Type de bon ──────────────────────────────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Type de bon</div>
          <div className={styles.field}>
            <label className={styles.label}>Type *</label>
            <select name="bonType" value={form.bonType} onChange={handleChange} className={styles.select}>
              {BON_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Client ───────────────────────────────────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            Client / Destinataire
            <Button type="button" variant="secondary" size="sm"
              onClick={() => setShowClientModal(true)} style={{ marginLeft: "1rem" }}>
              Choisir depuis la liste
            </Button>
          </div>

          {form.clientId && <p className={styles.clientBadge}>Client lié : ID #{form.clientId}</p>}

          <div className={styles.row}>
            <Input name="legalName" label="Nom légal / Raison sociale *"
              value={form.legalName} onChange={handleChange} error={errors.legalName} />
            <Input name="NIF" label="NIF"
              value={form.NIF} onChange={handleChange} />
          </div>
          <div className={styles.row}>
            <Input name="AI" label="Article d'imposition"
              value={form.AI} onChange={handleChange} />
            <Input name="RC" label="Registre de commerce"
              value={form.RC} onChange={handleChange} />
          </div>
          <div className={styles.row}>
            <Input name="tel" label="Téléphone"
              value={form.tel} onChange={handleChange} />
            <Input name="NIS" label="NIS"
              value={form.NIS} onChange={handleChange} />
          </div>
          <Input name="address" label="Adresse"
            value={form.address} onChange={handleChange} />
        </div>

        {/* ── Date ─────────────────────────────────────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Informations générales</div>
          <div className={styles.row}>
            <Input name="bonDate" label="Date *" type="date"
              value={form.bonDate} onChange={handleChange} error={errors.bonDate} />
          </div>
        </div>

        {/* ── Lignes ───────────────────────────────────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            Articles
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
                  <button type="button" className={styles.addLineBtn} onClick={() => openProductPicker(i)}>
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
                <Input label={line.unit ? `Quantité (${line.unit})` : "Quantité *"}
                  name="quantity" type="number" min="0.001" step="any"
                  value={line.quantity} onChange={(e) => handleLineChange(i, e)}
                  error={errors[`line_${i}_quantity`]} />
                <Input label="Prix unitaire HT (optionnel)" name="pricePerUnitOverride"
                  type="number" min="0" step="any" placeholder="Laisser vide = prix catalogue"
                  value={line.pricePerUnitOverride} onChange={(e) => handleLineChange(i, e)} />
                <Input label="TVA % (optionnel)" name="tvaOverride"
                  type="number" min="0" step="any" placeholder="Laisser vide = TVA produit"
                  value={line.tvaOverride} onChange={(e) => handleLineChange(i, e)} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Notes ────────────────────────────────────────────────────────── */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Observations</div>
          <textarea name="notes" className={styles.textarea} rows={3}
            placeholder="Remarques, conditions, etc."
            value={form.notes} onChange={handleChange} />
        </div>

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <div className={styles.actions}>
          <Button variant="secondary" type="button" onClick={() => navigate("/documents")}>Annuler</Button>
          <Button type="submit" loading={loading}>Créer le bon</Button>
        </div>

      </form>

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
