import { useState, useEffect } from "react";
import { getCompany, updateCompany } from "../../api/settingsApi";
import { PageHeader, Card, CardHeader, Alert } from "../../components/ui/UI";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import styles from "./SettingsPage.module.css";

export default function SettingsPage() {
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

  if (loading) return <Loading />;

  return (
    <div>
      <PageHeader
        title="Paramètres"
        subtitle="Gérez les informations de votre entreprise."
      />

      {error   && <Alert variant="danger"  onDismiss={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success" onDismiss={() => setSuccess("")}>{success}</Alert>}

      <form onSubmit={handleSubmit} noValidate>
        <Card padding="md" className={styles.card}>
          <CardHeader title="Informations de l'entreprise" subtitle="Ces données apparaissent sur les factures générées." />

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Identification</div>
            <div className={styles.row}>
              <Input
                name="name"
                label="Nom commercial *"
                value={form.name || ""}
                onChange={handleChange}
              />
              <Input
                name="legalName"
                label="Raison sociale"
                value={form.legalName || ""}
                onChange={handleChange}
              />
            </div>
            <div className={styles.row}>
              <Input
                name="email"
                label="E-mail"
                type="email"
                value={form.email || ""}
                onChange={handleChange}
              />
              <Input
                name="tel"
                label="Téléphone"
                value={form.tel || ""}
                onChange={handleChange}
              />
            </div>
            <Input
              name="adresse"
              label="Adresse"
              value={form.adresse || ""}
              onChange={handleChange}
            />
            <Input
              name="website"
              label="Site web"
              value={form.website || ""}
              onChange={handleChange}
            />
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>Identifiants légaux</div>
            <div className={styles.row}>
              <Input name="nif" label="NIF"  value={form.nif || ""}  onChange={handleChange} />
              <Input name="nis" label="NIS"  value={form.nis || ""}  onChange={handleChange} />
            </div>
            <div className={styles.row}>
              <Input name="rc"  label="RC"   value={form.rc  || ""}  onChange={handleChange} />
              <Input name="ai"  label="AI"   value={form.ai  || ""}  onChange={handleChange} />
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
    </div>
  );
}
