import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Alert } from "../../components/ui/UI";
import styles from "./AuthPage.module.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form, setForm]         = useState({ email: "", password: "" });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.email)    errs.email    = "Veuillez saisir votre adresse e-mail.";
    if (!form.password) errs.password = "Veuillez saisir votre mot de passe.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Connexion impossible. Vérifiez vos identifiants.";
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>FS</div>
          <h1 className={styles.title}>Connexion</h1>
          <p className={styles.subtitle}>
            Bienvenue sur <strong>FactuStock</strong>.<br />
            Connectez-vous pour accéder à votre espace.
          </p>
        </div>

        {apiError && (
          <Alert variant="danger" onDismiss={() => setApiError("")}>
            {apiError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate className={styles.form}>
          <Input
            id="email" name="email" type="email"
            label="Adresse e-mail"
            placeholder="exemple@entreprise.dz"
            value={form.email} onChange={handleChange}
            error={errors.email} required
            autoComplete="email" autoFocus
          />
          <Input
            id="password" name="password" type="password"
            label="Mot de passe"
            placeholder="Votre mot de passe"
            value={form.password} onChange={handleChange}
            error={errors.password} required
            autoComplete="current-password"
          />
          <Button type="submit" fullWidth size="lg" loading={loading}>
            Se connecter
          </Button>
        </form>

        <p className={styles.footer}>
          Problème de connexion ? Contactez votre administrateur.
        </p>
      </div>
    </div>
  );
}