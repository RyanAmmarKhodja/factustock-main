import { useState, useEffect } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Alert } from "../../components/ui/UI";
import styles from "./GenerateInvoice.module.css";
import { createInvoice } from "../../api/documentApi";

import ClientSelectionFormModal from "./ClientSelectionFormModal";
import ProductSelectionFormModal from "./ProductSelectionFormModal";

const PAYMENT_METHODS = [
  { value: 0, label: "Espèces" },
  { value: 1, label: "Virement bancaire" },
  { value: 2, label: "Chèque" },
];

const emptyLine = () => ({
  productId: "",
  designation: "",
  quantity: 1,
  unitOverride: "",
  pricePerUnitOverride: "",
  tvaOverride: "",
  priceHorsTaxe: "",
  priceTTC: ""

});

export default function GenerateInvoice({
  mode = "create",
  invoice = null,
  onClose,
}) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    clientId: invoice?.clientId ?? "",
    legalName: invoice?.legalName ?? "",
    address: invoice?.address ?? "",
    NIF: invoice?.NIF ?? "",
    AI: invoice?.AI ?? "",
    RC: invoice?.RC ?? "",

    invoiceDate: invoice?.invoiceDate
      ? invoice.invoiceDate.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    dueDate: invoice?.dueDate ? invoice.dueDate.slice(0, 10) : "",
    paymentMethod: invoice?.paymentMethod ?? 0,
    notes: invoice?.notes ?? "",
    lines: invoice?.lines?.length
      ? invoice.lines.map((l) => ({ ...l }))
      : [emptyLine()],
  });

  const [showClient, setShowClient] = useState(false);
  const [showProduct, setShowProduct] = useState(false);

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleUpdate = (updatedForm) => {
    setForm(updatedForm); // Update Page A state
  };

  const handleProductUpdate = () => {};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
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
    setForm((prev) => ({ ...prev, lines: [...prev.lines, emptyLine()] }));
    setShowProduct(true)
  };

  const removeLine = (i) =>
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, idx) => idx !== i),
    }));

  const validate = () => {
    const errs = {};
    if (!form.clientId) errs.clientId = "Le client est obligatoire.";
    if (!form.invoiceDate)
      errs.invoiceDate = "La date de facture est obligatoire.";
    form.lines.forEach((l, i) => {
      if (!l.productId) errs[`line_${i}_productId`] = "Produit requis.";
      if (!l.quantity || Number(l.quantity) <= 0)
        errs[`line_${i}_quantity`] = "Qté invalide.";
    });
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        clientId: Number(form.clientId),
        invoiceDate: new Date(form.invoiceDate).toISOString(),
        dueDate: form.dueDate
          ? new Date(form.dueDate).toISOString()
          : undefined,
        paymentMethod: Number(form.paymentMethod),
        notes: form.notes.trim() || undefined,
        lines: form.lines.map((l) => ({
          productId: Number(l.productId),
          quantity: Number(l.quantity),
          pricePerUnitOverride:
            l.pricePerUnitOverride !== ""
              ? Number(l.pricePerUnitOverride)
              : undefined,
          tvaOverride: l.tvaOverride !== "" ? Number(l.tvaOverride) : undefined,
        })),
      };
      await createInvoice(payload);
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.message || "Une erreur s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <h2 className={styles.modalTitle}>
          {isEdit ? "Modifier la facture" : "Créer une facture"}
        </h2>
      </div>

      <div className={styles.body}>
        {apiError && (
          <Alert variant="danger" onDismiss={() => setApiError("")}>
            {apiError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          {/* Section: Informations générales */}
          <div className={styles.sectionTitle}>Informations générales</div>
          <div>
            <p style={{ fontWeight: "600" }}>Client : </p>
            <Button
              style={{ marginTop: ".2em" }}
              variant="secondary"
              onClick={() => setShowClient(true)}
            >
              Seléctionner un client
            </Button>

            <div className={styles.row}>
              <Input
                id={`legalName`}
                name="legalName"
                label="Nom légal"
                type="string"
                placeholder="Nom légal"
                value={form.legalName}
                onChange={handleChange}
              />
              <Input
                id={`NIF`}
                name="NIF"
                label="NIF :"
                type="string"
                placeholder="NIF"
                value={form.NIF}
                onChange={handleChange}
              />
            </div>

            <div className={styles.row}>
              <Input
                id={`AI`}
                name="AI"
                label="AI "
                type="string"
                placeholder="AI"
                value={form.AI}
                onChange={handleChange}
              />
              <Input
                id={`RC`}
                name="RC"
                label="RC "
                type="string"
                placeholder="RC"
                value={form.RC}
                onChange={handleChange}
              />
            </div>

            <Input
              id={`Adresse`}
              name="address"
              label="Adresse "
              type="string"
              placeholder="Adresse"
              value={form.address}
              onChange={handleChange}
            />
          </div>
          <div>
            <div className={styles.field}>
              <label htmlFor="paymentMethod" className={styles.label}>
                Mode de paiement
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
                className={styles.select}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              id="invoiceDate"
              name="invoiceDate"
              label="Date de facture"
              type="date"
              value={form.invoiceDate}
              onChange={handleChange}
              error={errors.invoiceDate}
              required
            />
            <Input
              id="dueDate"
              name="dueDate"
              label="Date d'échéance"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
            />
          </div>

          {/* Section: Lignes de facture */}
          <div className={styles.sectionTitle}>
            Lignes de facture
            <button
              type="button"
              className={styles.addLineBtn}
              onClick={addLine}
            >
              + Ajouter une ligne
            </button>
          </div>

          {form.lines.map((line, i) => (
            <div key={i} className={styles.lineBlock}>
              <div className={styles.lineHeader}>
                <span className={styles.lineLabel}>Ligne {i + 1}</span>
                {form.lines.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeLineBtn}
                    onClick={() => removeLine(i)}
                  >
                    Supprimer
                  </button>
                )}
              </div>
              <div className={styles.row}>
                <Input
                  id={`productName_${i}`}
                  name="productName"
                  label="Designation"
                  type="text"
                  value={line.productName}
                  onChange={(e) => handleLineChange(i, e)}
                  error={errors[`line_${i}_productName`]}
                  required
                />
                <Input
                  id={`quantity_${i}`}
                  name="quantity"
                  label={line.unit ? `Quantité `+ line.unit: `Quantité`}
                  type="number"
                  value={line.quantity}
                  onChange={(e) => handleLineChange(i, e)}
                  error={errors[`line_${i}_quantity`]}
                  required
                />
              </div>
              <div className={styles.row}>
                <Input
                  id={`pricePerUnitOverride_${i}`}
                  name="pricePerUnitOverride"
                  label="Prix unitaire (override)"
                  type="number"
                  placeholder="Laisser vide = prix produit"
                  value={line.pricePerUnitOverride}
                  onChange={(e) => handleLineChange(i, e)}
                />
                <Input
                  id={`tvaOverride_${i}`}
                  name="tvaOverride"
                  label="TVA % (override)"
                  type="number"
                  placeholder="Laisser vide = TVA produit"
                  value={line.tvaOverride}
                  onChange={(e) => handleLineChange(i, e)}
                />
              </div>
            </div>
          ))}

          {/* Section: Notes */}
          <div className={styles.sectionTitle}>Notes</div>
          <textarea
            id="notes"
            name="notes"
            className={styles.textarea}
            rows={3}
            placeholder="Remarques, conditions, etc."
            value={form.notes}
            onChange={handleChange}
          />

          {/* Actions */}
          <div className={styles.actions}>
            <Button variant="secondary" onClick={onClose} type="button">
              Annuler
            </Button>
            <Button type="submit" loading={loading}>
              {isEdit ? "Enregistrer" : "Créer la facture"}
            </Button>
          </div>
        </form>
      </div>

      {showClient && (
        <ClientSelectionFormModal
          mode="create"
          initialData={form}
          onSave={handleUpdate}
          onClose={() => setShowClient(false)}
        />
      )}

      {showProduct && (
        <ProductSelectionFormModal
          mode="create"
          initialData={form}
          onSave={handleProductUpdate}
          onClose={() => setShowProduct(false)}
        />
      )}
    </div>
  );
}
