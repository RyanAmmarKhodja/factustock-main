import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerAdmin } from "../../api/authApi";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Alert } from "../../components/ui/UI";
import styles from "./AuthPage.module.css";

export default function SetupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim())  errs.firstName = "Le prénom est obligatoire.";
    if (!form.lastName.trim())   errs.lastName  = "Le nom est obligatoire.";
    if (!form.email.trim())      errs.email     = "L'adresse e-mail est obligatoire.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Adresse e-mail invalide.";
    if (!form.password)          errs.password  = "Le mot de passe est obligatoire.";
    else if (form.password.length < 8) errs.password = "Le mot de passe doit contenir au moins 8 caractères.";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Les mots de passe ne correspondent pas.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await registerAdmin({
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        email:     form.email.trim(),
        password:  form.password,
        phone:     form.phone.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || "Une erreur s'est produite. Réessayez.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card} style={{ maxWidth: 520 }}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>FS</div>
          <h1 className={styles.title}>Configuration initiale</h1>
          <p className={styles.subtitle}>
            Bienvenue sur <strong>FactuStock</strong>. Cette étape est <strong>unique</strong> : 
            créez le compte administrateur de votre entreprise.
          </p>
        </div>

        {/* Info banner */}
        <Alert variant="info">
          Ce compte administrateur aura accès à toutes les fonctionnalités du logiciel, 
          y compris la gestion des utilisateurs et le journal d'audit.
        </Alert>

        {apiError && (
          <Alert variant="danger" onDismiss={() => setApiError("")}>
            {apiError}
          </Alert>
        )}

        {success && (
          <Alert variant="success">
            Compte créé avec succès ! Redirection vers la page de connexion...
          </Alert>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} noValidate className={styles.form}>
            {/* Name row */}
            <div className={styles.row}>
              <Input
                id="firstName"
                name="firstName"
                label="Prénom"
                placeholder="Mohamed"
                value={form.firstName}
                onChange={handleChange}
                error={errors.firstName}
                required
                autoFocus
              />
              <Input
                id="lastName"
                name="lastName"
                label="Nom"
                placeholder="Benali"
                value={form.lastName}
                onChange={handleChange}
                error={errors.lastName}
                required
              />
            </div>

            <Input
              id="email"
              name="email"
              type="email"
              label="Adresse e-mail"
              placeholder="admin@entreprise.dz"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              required
              autoComplete="email"
            />

            <Input
              id="phone"
              name="phone"
              type="tel"
              label="Numéro de téléphone"
              placeholder="0555 00 00 00"
              value={form.phone}
              onChange={handleChange}
              hint="Facultatif"
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Mot de passe"
              placeholder="Minimum 8 caractères"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              required
              hint="Utilisez au moins 8 caractères avec des chiffres et lettres."
              autoComplete="new-password"
            />

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirmer le mot de passe"
              placeholder="Répétez le mot de passe"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
            >
              Créer le compte administrateur
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}