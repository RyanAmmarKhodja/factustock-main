import { useState, useEffect } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Alert } from "../ui/UI";
import styles from "./ClientFormModal.module.css";

/**
 * Create / Edit client modal — Fluent Panel pattern.
 *
 * @param {"create"|"edit"} mode
 * @param {object|null}     client   — existing client data (edit only)
 * @param {function}        onClose
 * @param {function}        onSubmit — (formData) => Promise<void>
 */
export default function ClientFormModal({ mode = "create", client = null, onClose, onSubmit }) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    type:      client?.type      ?? 0,    // 0 = Individual, 1 = Company — backend enum index
    legalName: client?.legalName ?? "",
    lastName:  client?.lastName  ?? "",
    firstName: client?.firstName ?? "",
    email:     client?.email     ?? "",
    tel:       client?.tel       ?? "",
    adresse:   client?.adresse   ?? "",
    rc:        client?.rc        ?? "",
    ai:        client?.ai        ?? "",
    nif:       client?.nif       ?? "",
    nis:       client?.nis       ?? "",
    n_BL:      client?.n_BL      ?? "",
    n_BP:      client?.n_BP      ?? "",
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
    if (!form.legalName.trim()) errs.legalName = "La raison sociale est obligatoire.";
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Adresse e-mail invalide.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        type:      Number(form.type),
        legalName: form.legalName.trim(),
        lastName:  form.lastName.trim()  || undefined,
        firstName: form.firstName.trim() || undefined,
        email:     form.email.trim()     || undefined,
        tel:       form.tel.trim()       || undefined,
        adresse:   form.adresse.trim()   || undefined,
        rc:        form.rc.trim()        || undefined,
        ai:        form.ai.trim()        || undefined,
        nif:       form.nif.trim()       || undefined,
        nis:       form.nis.trim()       || undefined,
        n_BL:      form.n_BL.trim()      || undefined,
        n_BP:      form.n_BP.trim()      || undefined,
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
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="client-modal-title">

        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 id="client-modal-title" className={styles.modalTitle}>
            {isEdit ? "Modifier le client" : "Ajouter un client"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {apiError && (
            <Alert variant="danger" onDismiss={() => setApiError("")}>{apiError}</Alert>
          )}

          <form onSubmit={handleSubmit} noValidate className={styles.form}>
            {/* Section: Identité */}
            <div className={styles.sectionTitle}>Identité</div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="type" className={styles.label}>
                  Type <span className={styles.required}> *</span>
                </label>
                <select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value={0}>Particulier</option>
                  <option value={1}>Entreprise</option>
                </select>
              </div>
              <Input
                id="legalName" name="legalName" label="Raison sociale"
                value={form.legalName} onChange={handleChange}
                error={errors.legalName} required autoFocus
              />
            </div>

            <div className={styles.row}>
              <Input
                id="lastName" name="lastName" label="Nom"
                value={form.lastName} onChange={handleChange}
              />
              <Input
                id="firstName" name="firstName" label="Prénom"
                value={form.firstName} onChange={handleChange}
              />
            </div>

            {/* Section: Contact */}
            <div className={styles.sectionTitle}>Contact</div>

            <div className={styles.row}>
              <Input
                id="email" name="email" type="email" label="E-mail"
                placeholder="client@entreprise.dz"
                value={form.email} onChange={handleChange}
                error={errors.email}
              />
              <Input
                id="tel" name="tel" type="tel" label="Téléphone"
                placeholder="0555 00 00 00"
                value={form.tel} onChange={handleChange}
              />
            </div>

            <Input
              id="adresse" name="adresse" label="Adresse"
              value={form.adresse} onChange={handleChange}
            />

            {/* Section: Identifiants légaux */}
            <div className={styles.sectionTitle}>Identifiants légaux</div>

            <div className={styles.row}>
              <Input id="rc"  name="rc"  label="RC"  value={form.rc}  onChange={handleChange} />
              <Input id="ai"  name="ai"  label="AI"  value={form.ai}  onChange={handleChange} />
            </div>
            <div className={styles.row}>
              <Input id="nif" name="nif" label="NIF" value={form.nif} onChange={handleChange} />
              <Input id="nis" name="nis" label="NIS" value={form.nis} onChange={handleChange} />
            </div>

            {/* Section: Numéros documents */}
            <div className={styles.sectionTitle}>Numéros de documents</div>

            <div className={styles.row3}>
              <Input id="n_BL"      name="n_BL"      label="N° BL"      value={form.n_BL}      onChange={handleChange} />
              <Input id="n_BP"      name="n_BP"      label="N° BP"      value={form.n_BP}      onChange={handleChange} />
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <Button variant="secondary" onClick={onClose} type="button">
                Annuler
              </Button>
              <Button type="submit" loading={loading}>
                {isEdit ? "Enregistrer" : "Créer le client"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
