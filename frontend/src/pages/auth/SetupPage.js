import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerAdmin, registerCompany } from "../../api/authApi";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { Alert } from "../../components/ui/UI";
import styles from "./AuthPage.module.css";

import api from "../../api/api";

export default function SetupPage() {
  const navigate = useNavigate();

  const [adminForm, setAdminForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [companyForm, setCompanyForm] = useState({
    name: "",
    email: "",
    phone: "", // Fixed: was using 'tel' in state but 'phone' in Input name
    adress: "",
    rc: "",
    ai: "",
    nif: "",
    nis: "",
    n_bl: "",
    n_bp: "",
    n_facture: "",
    logo: "",
    website: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [adminSetup, setAdminSetup] = useState(false);
  const [companySetup, setCompanySetup] = useState(true);

  const handleAdminChange = (e) => {
    setAdminForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setApiError("");
  };

  const handleCompanyChange = (e) => {
    setCompanyForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setApiError("");
  };

  const validateAdmin = () => {
    const errs = {};
    if (!adminForm.firstName.trim()) errs.firstName = "Le prénom est obligatoire.";
    if (!adminForm.lastName.trim()) errs.lastName = "Le nom est obligatoire.";
    if (!adminForm.email.trim()) errs.email = "L'adresse e-mail est obligatoire.";
    else if (!/\S+@\S+\.\S+/.test(adminForm.email))
      errs.email = "Adresse e-mail invalide.";
    if (!adminForm.password) errs.password = "Le mot de passe est obligatoire.";
    else if (adminForm.password.length < 8)
      errs.password = "Le mot de passe doit contenir au moins 8 caractères.";
    if (adminForm.password !== adminForm.confirmPassword)
      errs.confirmPassword = "Les mots de passe ne correspondent pas.";
    return errs;
  };

  const validateCompany = () => {
    const errs = {};
    if (!companyForm.name.trim()) errs.name = "Le nom est obligatoire.";
    return errs;
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    const errs = validateAdmin();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await registerAdmin({
        firstName: adminForm.firstName.trim(),
        lastName: adminForm.lastName.trim(),
        email: adminForm.email.trim(),
        password: adminForm.password,
        phone: adminForm.phone.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 2500);
    } catch (err) {
      setApiError(err.response?.data?.message || "Une erreur s'est produite.");
    } finally {

      setLoading(false);
      api.put("/system/complete-setup",{setupCompleted: true})
    }
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    const errs = validateCompany();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await registerCompany({
        Name: companyForm.name.trim(),
        Email: companyForm.email.trim(),
        Tel: companyForm.phone.trim(),
        Adresse: companyForm.adress.trim(),
        RC: companyForm.rc.trim(),
        AI: companyForm.ai.trim(),
        NIF: companyForm.nif.trim(),
        NIS: companyForm.nis.trim(),
        N_BL: companyForm.n_bl.trim(),
        N_BP: companyForm.n_bp.trim(),
        N_Facture: companyForm.n_facture.trim(),
        LogoUrl: companyForm.logo.trim(),
        Website: companyForm.website.trim(),
      });
      
      setCompanySetup(false);
      setAdminSetup(true);
    } catch (err) {
      setApiError(err.response?.data?.message || "Une erreur s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className={styles.page}>
      <div className={styles.card} style={{ maxWidth: 520 }}>
        <div className={styles.header}>
          <div className={styles.logo}>FS</div>
          <h1 className={styles.title}>Configuration initiale</h1>
          <p className={styles.subtitle}>
            Bienvenue sur <strong>FactuStock</strong>. Cette étape est{" "}
            <strong>unique</strong> :
            {adminSetup && " créez le compte administrateur de votre entreprise."}
            {companySetup && " remplissez les données de votre entreprise."}
          </p>
        </div>

        {adminSetup && (
          <Alert variant="info">
            Ce compte administrateur aura accès à toutes les fonctionnalités.
          </Alert>
        )}
        
        {apiError && (
          <Alert variant="danger" onDismiss={() => setApiError("")}>
            {apiError}
          </Alert>
        )}

        {success && (
          <Alert variant="success">
            Compte créé avec succès ! Redirection...
          </Alert>
        )}

        {companySetup && (
          <form onSubmit={handleCompanySubmit} className={styles.form}>
            <Input
              id="name"
              name="name"
              label="Nom de votre entreprise"
              value={companyForm.name}
              onChange={handleCompanyChange}
              error={errors.name}
              required
            />

            <Input
              id="email"
              name="email"
              type="email"
              label="Adresse e-mail officielle"
              value={companyForm.email}
              onChange={handleCompanyChange}
            />

            <Input
              id="phone"
              name="phone"
              type="tel"
              label="Numéro de téléphone"
              value={companyForm.phone}
              onChange={handleCompanyChange}
              required
            />

            <Input
              id="adress"
              name="adress"
              label="Adresse"
              value={companyForm.adress}
              onChange={handleCompanyChange}
            />

            <div className={styles.row}>
              <Input id="rc" name="rc" label="RC" value={companyForm.rc} onChange={handleCompanyChange} />
              <Input id="ai" name="ai" label="AI" value={companyForm.ai} onChange={handleCompanyChange} />
            </div>

            <div className={styles.row}>
              <Input id="nif" name="nif" label="NIF" value={companyForm.nif} onChange={handleCompanyChange} />
              <Input id="nis" name="nis" label="NIS" value={companyForm.nis} onChange={handleCompanyChange} />
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Suivant : Configurer l'admin
            </Button>
          </form>
        )}

        {adminSetup && (
          <form onSubmit={handleAdminSubmit} noValidate className={styles.form}>
            <div className={styles.row}>
              <Input
                id="firstName"
                name="firstName"
                label="Prénom"
                value={adminForm.firstName}
                onChange={handleAdminChange}
                error={errors.firstName}
                required
              />
              <Input
                id="lastName"
                name="lastName"
                label="Nom"
                value={adminForm.lastName}
                onChange={handleAdminChange}
                error={errors.lastName}
                required
              />
            </div>

            <Input
              id="admin_email"
              name="email"
              type="email"
              label="Adresse e-mail"
              value={adminForm.email}
              onChange={handleAdminChange}
              error={errors.email}
              required
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Mot de passe"
              value={adminForm.password}
              onChange={handleAdminChange}
              error={errors.password}
              required
            />

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirmer le mot de passe"
              value={adminForm.confirmPassword}
              onChange={handleAdminChange}
              error={errors.confirmPassword}
              required
            />

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Finaliser l'installation
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}