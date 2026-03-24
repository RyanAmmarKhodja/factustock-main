import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClient, updateClient, archiveClient, restoreClient } from "../../api/clientApi";
import { PageHeader, Card, Badge, Alert } from "../../components/ui/UI";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ClientFormModal from "../../components/clients/ClientFormModal";
import styles from "./ClientDetails.module.css";

const typeLabel = (t) => (t === 1 || t === "Company") ? "Entreprise" : "Particulier";

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [showEdit, setShowEdit]     = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // "archive" | "restore" | null

  const fetchClient = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getClient(id);
      setClient(res.data);
    } catch {
      setError("Client introuvable.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchClient(); }, [fetchClient]);

  // Edit
  const handleEdit = async (formData) => {
    await updateClient(id, formData);
    setSuccess("Client mis à jour avec succès.");
    fetchClient();
  };

  // Archive / Restore
  const handleArchiveRestore = async () => {
    try {
      if (confirmAction === "archive") {
        await archiveClient(id);
        setSuccess("Client archivé avec succès.");
      } else {
        await restoreClient(id);
        setSuccess("Client restauré avec succès.");
      }
      setConfirmAction(null);
      fetchClient();
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur s'est produite.");
      setConfirmAction(null);
    }
  };

  if (loading) return <Loading />;
  if (error && !client) {
    return (
      <div>
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate("/clients")} style={{ marginTop: 16 }}>
          ← Retour aux clients
        </Button>
      </div>
    );
  }
  if (!client) return null;

  const infoFields = [
    { label: "Raison sociale", value: client.legalName },
    { label: "Type",           value: typeLabel(client.type) },
    { label: "Nom",            value: client.lastName },
    { label: "Prénom",         value: client.firstName },
    { label: "E-mail",         value: client.email },
    { label: "Téléphone",      value: client.tel },
    { label: "Adresse",        value: client.adresse },
    { label: "RC",             value: client.rc },
    { label: "AI",             value: client.ai },
    { label: "NIF",            value: client.nif },
    { label: "NIS",            value: client.nis },
    { label: "N° BL",          value: client.n_BL },
    { label: "N° BP",          value: client.n_BP },
    { label: "N° Facture",     value: client.n_Facture },
    { label: "Créé le",        value: new Date(client.createdAt).toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit", year: "numeric" }) },
  ];

  return (
    <div>
      <PageHeader
        title={client.legalName}
        subtitle={
          <span className={styles.subtitleRow}>
            {typeLabel(client.type)}
            {client.isArchived && <Badge variant="warning">Archivé</Badge>}
          </span>
        }
        action={
          <Button variant="ghost" onClick={() => navigate("/clients")}>
            ← Retour aux clients
          </Button>
        }
      />

      {error   && <Alert variant="danger"  onDismiss={() => setError("")}>{error}</Alert>}
      {success && <Alert variant="success" onDismiss={() => setSuccess("")}>{success}</Alert>}

      {/* Action buttons */}
      <div className={styles.actionBar}>
        <Button onClick={() => setShowEdit(true)}>
          Modifier
        </Button>
        <Button
          variant={client.isArchived ? "primary" : "danger"}
          onClick={() => setConfirmAction(client.isArchived ? "restore" : "archive")}
        >
          {client.isArchived ? "Restaurer" : "Archiver"}
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/clients/${id}/stats`)}>
          📊 Statistiques
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/clients/${id}/factures`)}>
          📄 Factures
        </Button>
      </div>

      {/* Client info */}
      <Card padding="md" className={styles.infoCard}>
        <div className={styles.infoGrid}>
          {infoFields.map((field) => (
            <div key={field.label} className={styles.infoItem}>
              <span className={styles.infoLabel}>{field.label}</span>
              <span className={styles.infoValue}>{field.value || <span className={styles.muted}>—</span>}</span>
            </div>
          ))}
        </div>

        {client.isArchived && client.archivedAt && (
          <div className={styles.archivedBanner}>
            <span>⚠</span>
            <span>
              Ce client a été archivé le{" "}
              {new Date(client.archivedAt).toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </span>
          </div>
        )}
      </Card>

      {/* Edit modal */}
      {showEdit && (
        <ClientFormModal
          mode="edit"
          client={client}
          onClose={() => setShowEdit(false)}
          onSubmit={handleEdit}
        />
      )}

      {/* Confirm dialog */}
      {confirmAction && (
        <ConfirmDialog
          title={confirmAction === "archive" ? "Archiver le client ?" : "Restaurer le client ?"}
          message={
            confirmAction === "archive"
              ? <span>Vous êtes sur le point d'archiver <strong>{client.legalName}</strong>. Les factures existantes seront conservées, mais le client ne sera plus visible par défaut.</span>
              : <span>Vous êtes sur le point de restaurer <strong>{client.legalName}</strong>. Le client redeviendra visible dans la liste active.</span>
          }
          confirmLabel={confirmAction === "archive" ? "Oui, archiver" : "Oui, restaurer"}
          variant={confirmAction === "archive" ? "danger" : "primary"}
          onConfirm={handleArchiveRestore}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
