import { useState, useEffect } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Alert } from "../ui/UI";
import styles from "./UserFormModal.module.css";

/**
 * mode: "create" | "edit"
 * user: existing user data (only for edit mode)
 * onClose: () => void
 * onSubmit: (formData) => Promise<void>
 */
export default function UserFormModal({ mode = "create", user = null, onClose, onSubmit }) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    firstName:       user?.firstName       ?? "",
    lastName:        user?.lastName        ?? "",
    email:           user?.email           ?? "",
    phone:           user?.phone           ?? "",
    password:        "",
    confirmPassword: "",
    active:          user?.active          ?? true,
  });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [e.target.name]: value }));
    setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim())  errs.firstName = "Le prénom est obligatoire.";
    if (!form.lastName.trim())   errs.lastName  = "Le nom est obligatoire.";
    if (!isEdit) {
      if (!form.email.trim())    errs.email = "L'adresse e-mail est obligatoire.";
      else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Adresse e-mail invalide.";
      if (!form.password)        errs.password = "Le mot de passe est obligatoire.";
      else if (form.password.length < 8) errs.password = "Minimum 8 caractères.";
      if (form.password !== form.confirmPassword)
        errs.confirmPassword = "Les mots de passe ne correspondent pas.";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = isEdit
        ? { firstName: form.firstName.trim(), lastName: form.lastName.trim(), phone: form.phone.trim() || undefined, active: form.active }
        : { firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), password: form.password, phone: form.phone.trim() || undefined };

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
    /* Backdrop */
    <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">

        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 id="modal-title" className={styles.modalTitle}>
            {isEdit ? "Modifier l'utilisateur" : "Ajouter un employé"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          {apiError && (
            <Alert variant="danger" onDismiss={() => setApiError("")}>{apiError}</Alert>
          )}

          <form onSubmit={handleSubmit} noValidate className={styles.form}>
            <div className={styles.row}>
              <Input
                id="firstName" name="firstName" label="Prénom"
                value={form.firstName} onChange={handleChange}
                error={errors.firstName} required autoFocus
              />
              <Input
                id="lastName" name="lastName" label="Nom"
                value={form.lastName} onChange={handleChange}
                error={errors.lastName} required
              />
            </div>

            {!isEdit && (
              <Input
                id="email" name="email" type="email" label="Adresse e-mail"
                placeholder="employe@entreprise.dz"
                value={form.email} onChange={handleChange}
                error={errors.email} required
              />
            )}

            <Input
              id="phone" name="phone" type="tel" label="Téléphone"
              placeholder="0555 00 00 00"
              value={form.phone} onChange={handleChange}
              hint="Facultatif"
            />

            {!isEdit && (
              <>
                <Input
                  id="password" name="password" type="password" label="Mot de passe"
                  placeholder="Minimum 8 caractères"
                  value={form.password} onChange={handleChange}
                  error={errors.password} required
                />
                <Input
                  id="confirmPassword" name="confirmPassword" type="password" label="Confirmer le mot de passe"
                  placeholder="Répétez le mot de passe"
                  value={form.confirmPassword} onChange={handleChange}
                  error={errors.confirmPassword} required
                />
              </>
            )}

            {isEdit && (
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                  className={styles.checkbox}
                />
                <span>Compte actif</span>
                <span className={styles.checkboxHint}>
                  Décocher pour désactiver ce compte et libérer un siège.
                </span>
              </label>
            )}

            {/* Actions */}
            <div className={styles.actions}>
              <Button variant="secondary" onClick={onClose} type="button">
                Annuler
              </Button>
              <Button type="submit" loading={loading}>
                {isEdit ? "Enregistrer" : "Créer l'employé"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}