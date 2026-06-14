import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { changePassword, changeEmail } from "../../api/authApi";
import { PageHeader, Card, CardHeader, Alert } from "../../components/ui/UI";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import styles from "./AccountPage.module.css";

export default function AccountPage() {
  const { user, isAdmin } = useAuth();

  // ── Password form ────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwError, setPwError]     = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // ── Email form (admin only) ───────────────────────────────────────────────
  const [emailForm, setEmailForm] = useState({ currentPassword: "", newEmail: "" });
  const [emailError, setEmailError]     = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);  // show "are you sure"

  // ── Password handlers ────────────────────────────────────────────────────
  const handlePwChange = (e) => {
    setPwForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPwError("");
    setPwSuccess("");
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword)           { setPwError("Le mot de passe actuel est requis."); return; }
    if (pwForm.newPassword.length < 8)     { setPwError("Le nouveau mot de passe doit contenir au moins 8 caractères."); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError("Les mots de passe ne correspondent pas."); return; }

    setPwLoading(true);
    try {
      await changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwSuccess("Mot de passe mis à jour avec succès.");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwError(err.response?.data?.message || "Une erreur s'est produite.");
    } finally {
      setPwLoading(false);
    }
  };

  // ── Email handlers ───────────────────────────────────────────────────────
  const handleEmailChange = (e) => {
    setEmailForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setEmailError("");
    setEmailSuccess("");
    setConfirmEmail(false);
  };

  // First click → show confirmation. Second click (from confirm box) → submit.
  const handleEmailRequest = (e) => {
    e.preventDefault();
    if (!emailForm.newEmail.trim()) { setEmailError("La nouvelle adresse e-mail est requise."); return; }
    if (!emailForm.currentPassword) { setEmailError("Le mot de passe actuel est requis pour confirmer."); return; }
    setConfirmEmail(true);
  };

  const handleEmailConfirm = async () => {
    setEmailLoading(true);
    try {
      await changeEmail({
        currentPassword: emailForm.currentPassword,
        newEmail: emailForm.newEmail,
      });
      setEmailSuccess("Adresse e-mail mise à jour avec succès.");
      setEmailForm({ currentPassword: "", newEmail: "" });
      setConfirmEmail(false);
    } catch (err) {
      setEmailError(err.response?.data?.message || "Une erreur s'est produite.");
      setConfirmEmail(false);
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Mon compte"
        subtitle="Gérez votre mot de passe et vos informations de connexion."
      />

      {/* ── Change password ── */}
      <Card padding="md" className={styles.card}>
        <CardHeader
          title="Changer le mot de passe"
          subtitle="Choisissez un mot de passe fort d'au moins 8 caractères."
        />

        {pwError   && <Alert variant="danger"  onDismiss={() => setPwError("")}>{pwError}</Alert>}
        {pwSuccess && <Alert variant="success" onDismiss={() => setPwSuccess("")}>{pwSuccess}</Alert>}

        <form onSubmit={handlePwSubmit} noValidate>
          <div className={styles.fields}>
            <Input
              name="currentPassword"
              type="password"
              label="Mot de passe actuel"
              value={pwForm.currentPassword}
              onChange={handlePwChange}
            />
            <div className={styles.row}>
              <Input
                name="newPassword"
                type="password"
                label="Nouveau mot de passe"
                value={pwForm.newPassword}
                onChange={handlePwChange}
                hint="Minimum 8 caractères"
              />
              <Input
                name="confirmPassword"
                type="password"
                label="Confirmer le nouveau mot de passe"
                value={pwForm.confirmPassword}
                onChange={handlePwChange}
              />
            </div>
          </div>
          <div className={styles.actions}>
            <Button type="submit" loading={pwLoading}>
              Changer le mot de passe
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Change email (admin only) ── */}
      {isAdmin && (
        <Card padding="md" className={styles.card}>
          <CardHeader
            title="Changer l'adresse e-mail"
            subtitle={`Adresse actuelle : ${user?.email || "—"}`}
          />

          {emailError   && <Alert variant="danger"  onDismiss={() => setEmailError("")}>{emailError}</Alert>}
          {emailSuccess && <Alert variant="success" onDismiss={() => setEmailSuccess("")}>{emailSuccess}</Alert>}

          <form onSubmit={handleEmailRequest} noValidate>
            <div className={styles.fields}>
              <Input
                name="newEmail"
                type="email"
                label="Nouvelle adresse e-mail"
                value={emailForm.newEmail}
                onChange={handleEmailChange}
              />
              <Input
                name="currentPassword"
                type="password"
                label="Mot de passe actuel (confirmation)"
                value={emailForm.currentPassword}
                onChange={handleEmailChange}
              />
            </div>

            {confirmEmail ? (
              <div className={styles.confirmBox}>
                <p className={styles.confirmText}>
                  Êtes-vous sûr de vouloir changer votre adresse e-mail vers{" "}
                  <strong>{emailForm.newEmail}</strong> ?
                </p>
                <div className={styles.confirmActions}>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setConfirmEmail(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    loading={emailLoading}
                    onClick={handleEmailConfirm}
                  >
                    Oui, changer
                  </Button>
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
