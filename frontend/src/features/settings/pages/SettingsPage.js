import { useState, useEffect } from "react";
import { getCompany, updateCompany } from "../api/settingsApi";
import { changePassword, changeEmail } from "../../auth/api/authApi";
import { useAuth } from "../../../shared/context/AuthContext";
import { PageHeader, Card, CardHeader, Alert } from "../../../shared/components/UI";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import Loading from "../../../shared/components/Loading";
import styles from "../styles/SettingsPage.module.css";

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();

  // ── Company form ─────────────────────────────────────────────────────────
  const [form, setForm]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getCompany()
      .then((res) => setForm(res.data))
      .catch(() => setError("Impossible de charger les données de l'entreprise."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccess("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) { setError("Le nom de l'entreprise est obligatoire."); return; }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await updateCompany(form);
      setForm(res.data);
      setSuccess("Données mises à jour avec succès.");
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur s'est produite.");
    } finally {
      setSaving(false);
    }
  };

  // ── Password form ─────────────────────────────────────────────────────────
  const [pwForm, setPwForm]     = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwError, setPwError]   = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const handlePwChange = (e) => {
    setPwForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPwError("");
    setPwSuccess("");
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword)               { setPwError("Le mot de passe actuel est requis."); return; }
    if (pwForm.newPassword.length < 8)         { setPwError("Minimum 8 caractères."); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError("Les mots de passe ne correspondent pas."); return; }
    setPwLoading(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwSuccess("Mot de passe mis à jour avec succès.");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwError(err.response?.data?.message || "Une erreur s'est produite.");
    } finally {
      setPwLoading(false);
    }
  };

  // ── Email form (admin only) ───────────────────────────────────────────────
  const [emailForm, setEmailForm]       = useState({ currentPassword: "", newEmail: "" });
  const [emailError, setEmailError]     = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);

  const handleEmailChange = (e) => {
    setEmailForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setEmailError("");
    setEmailSuccess("");
    setConfirmEmail(false);
  };

  const handleEmailRequest = (e) => {
    e.preventDefault();
    if (!emailForm.newEmail.trim())  { setEmailError("La nouvelle adresse e-mail est requise."); return; }
    if (!emailForm.currentPassword)  { setEmailError("Le mot de passe actuel est requis."); return; }
    setConfirmEmail(true);
  };

  const handleEmailConfirm = async () => {
    setEmailLoading(true);
    try {
      await changeEmail({ currentPassword: emailForm.currentPassword, newEmail: emailForm.newEmail });
      setEmailSuccess("Adresse e-mail mise à jour.");
      setEmailForm({ currentPassword: "", newEmail: "" });
      setConfirmEmail(false);
    } catch (err) {
      setEmailError(err.response?.data?.message || "Une erreur s'est produite.");
      setConfirmEmail(false);
    } finally {
      setEmailLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Paramètres"
        subtitle="Gérez les informations de votre entreprise et votre compte."
      />

      {error   && <Alert variant="danger"  onDismiss={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success" onDismiss={() => setSuccess("")}>{success}</Alert>}

      {/* ── Company info ── */}
      <form onSubmit={handleSubmit} noValidate>
        <Card padding="md" className={styles.card}>
          <CardHeader title="Informations de l'entreprise" subtitle="Ces données apparaissent sur les factures et bons générés." />

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Identification</div>
            <div className={styles.row}>
              <Input name="name"     label="Nom commercial *" value={form.name     || ""} onChange={handleChange} />
              <Input name="legalName" label="Raison sociale"  value={form.legalName || ""} onChange={handleChange} />
            </div>
            <div className={styles.row}>
              <Input name="email" label="E-mail" type="email" value={form.email || ""} onChange={handleChange} />
              <Input name="tel"   label="Téléphone"           value={form.tel   || ""} onChange={handleChange} />
            </div>
            <Input name="adresse" label="Adresse" value={form.adresse || ""} onChange={handleChange} />
            <Input name="website" label="Site web" value={form.website || ""} onChange={handleChange} />
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Identifiants légaux</div>
            <div className={styles.row}>
              <Input name="nif" label="NIF" value={form.nif || ""} onChange={handleChange} />
              <Input name="nis" label="NIS" value={form.nis || ""} onChange={handleChange} />
            </div>
            <div className={styles.row}>
              <Input name="rc" label="RC" value={form.rc || ""} onChange={handleChange} />
              <Input name="ai" label="AI" value={form.ai || ""} onChange={handleChange} />
            </div>
            <div className={styles.row}>
              <Input name="n_BL" label="N° BL" value={form.n_BL || ""} onChange={handleChange} />
              <Input name="n_BP" label="N° BP" value={form.n_BP || ""} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.actions}>
            <Button type="submit" loading={saving}>Enregistrer les modifications</Button>
          </div>
        </Card>
      </form>

      {/* ── Change password ── */}
      <Card padding="md" className={styles.card}>
        <CardHeader title="Changer le mot de passe" subtitle="Choisissez un mot de passe fort d'au moins 8 caractères." />

        {pwError   && <Alert variant="danger"  onDismiss={() => setPwError("")}>{pwError}</Alert>}
        {pwSuccess && <Alert variant="success" onDismiss={() => setPwSuccess("")}>{pwSuccess}</Alert>}

        <form onSubmit={handlePwSubmit} noValidate>
          <div className={styles.section}>
            <Input name="currentPassword" type="password" label="Mot de passe actuel"
              value={pwForm.currentPassword} onChange={handlePwChange} />
            <div className={styles.row} style={{ marginTop: "var(--space-3)" }}>
              <Input name="newPassword" type="password" label="Nouveau mot de passe"
                value={pwForm.newPassword} onChange={handlePwChange} hint="Minimum 8 caractères" />
              <Input name="confirmPassword" type="password" label="Confirmer le nouveau mot de passe"
                value={pwForm.confirmPassword} onChange={handlePwChange} />
            </div>
          </div>
          <div className={styles.actions}>
            <Button type="submit" loading={pwLoading}>Changer le mot de passe</Button>
          </div>
        </form>
      </Card>

      {/* ── Change email (admin only) ── */}
      {isAdmin && (
        <Card padding="md" className={styles.card}>
          <CardHeader title="Changer l'adresse e-mail" subtitle={`Adresse actuelle : ${user?.email || "—"}`} />

          {emailError   && <Alert variant="danger"  onDismiss={() => setEmailError("")}>{emailError}</Alert>}
          {emailSuccess && <Alert variant="success" onDismiss={() => setEmailSuccess("")}>{emailSuccess}</Alert>}

          <form onSubmit={handleEmailRequest} noValidate>
            <div className={styles.section}>
              <div className={styles.row}>
                <Input name="newEmail" type="email" label="Nouvelle adresse e-mail"
                  value={emailForm.newEmail} onChange={handleEmailChange} />
                <Input name="currentPassword" type="password" label="Mot de passe actuel (confirmation)"
                  value={emailForm.currentPassword} onChange={handleEmailChange} />
              </div>
            </div>

            {confirmEmail ? (
              <div className={styles.confirmBox}>
                <p className={styles.confirmText}>
                  Êtes-vous sûr de vouloir changer votre adresse e-mail vers{" "}
                  <strong>{emailForm.newEmail}</strong> ?
                </p>
                <div className={styles.confirmActions}>
                  <Button variant="secondary" type="button" onClick={() => setConfirmEmail(false)}>Annuler</Button>
                  <Button type="button" loading={emailLoading} onClick={handleEmailConfirm}>Oui, changer</Button>
                </div>
              </div>
            ) : (
              <div className={styles.actions}>
                <Button type="submit">Changer l'adresse e-mail</Button>
              </div>
            )}
          </form>
        </Card>
      )}
    </div>
  );
}
