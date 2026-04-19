import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSupplier, updateSupplier, archiveSupplier, restoreSupplier } from "../../api/supplierApi";
import { PageHeader, Card, Badge, Alert } from "../../components/ui/UI";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import SupplierFormModal from "../../components/suppliers/SupplierFormModal";
import styles from "./SupplierDetails.module.css";

const typeLabel = (t) => (t === 1 || t === "Company") ? "Entreprise" : "Particulier";

export default function SupplierDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [supplier, setSupplier]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [success, setSuccess]       = useState("");
  const [showEdit, setShowEdit]     = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // "archive" | "restore" | null

  const fetchSupplier = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getSupplier(id);
      setSupplier(res.data);
    } catch {
      setError("Supplier introuvable.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchSupplier(); }, [fetchSupplier]);

  // Edit
  const handleEdit = async (formData) => {
    await updateSupplier(id, formData);
    setSuccess("Supplier mis à jour avec succès.");
    fetchSupplier();
  };

  // Archive / Restore
  const handleArchiveRestore = async () => {
    try {
      if (confirmAction === "archive") {
        await archiveSupplier(id);
        setSuccess("Supplier archivé avec succès.");
      } else {
        await restoreSupplier(id);
        setSuccess("Supplier restauré avec succès.");
      }
      setConfirmAction(null);
      fetchSupplier();
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur s'est produite.");
      setConfirmAction(null);
    }
  };

  if (loading) return <Loading />;
  if (error && !supplier) {
    return (
      <div>
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" size="md" onClick={() => navigate("/suppliers")} style={{ marginTop: 16 }}>
          ← Retour aux suppliers
        </Button>
      </div>
    );
  }
  if (!supplier) return null;

  const infoFields = [
    { label: "Raison sociale", value: supplier.legalName },
    { label: "Nom",            value: supplier.lastName },
    { label: "Prénom",         value: supplier.firstName },
    { label: "E-mail",         value: supplier.email },
    { label: "Téléphone",      value: supplier.tel },
    { label: "Adresse",        value: supplier.adresse },
    { label: "RC",             value: supplier.rc },
    { label: "AI",             value: supplier.ai },
    { label: "NIF",            value: supplier.nif },
    { label: "NIS",            value: supplier.nis },
    { label: "N° BL",          value: supplier.n_BL },
    { label: "N° BP",          value: supplier.n_BP },
   
    { label: "Créé le",        value: new Date(supplier.createdAt).toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit", year: "numeric" }) },
  ];

  return (
    <div>
      <PageHeader
        title={supplier.legalName}
        subtitle={
          <span className={styles.subtitleRow}>
            {typeLabel(supplier.type)}
            {supplier.isArchived && <Badge variant="warning">Archivé</Badge>}
          </span>
        }
        action={
          <Button variant="primary" size="md" onClick={() => navigate("/suppliers")}>
            ← Retour aux suppliers
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
          variant={supplier.isArchived ? "primary" : "danger"}
          onClick={() => setConfirmAction(supplier.isArchived ? "restore" : "archive")}
        >
          {supplier.isArchived ? "Restaurer" : "Archiver"}
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/suppliers/${id}/stats`)}>
          Statistiques
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/suppliers/${id}/factures`)}>
           Factures
        </Button>
      </div>

      {/* Supplier info */}
      <Card padding="md" className={styles.infoCard}>
        <div className={styles.infoGrid}>
          {infoFields.map((field) => (
            <div key={field.label} className={styles.infoItem}>
              <span className={styles.infoLabel}>{field.label}</span>
              <span className={styles.infoValue}>{field.value || <span className={styles.muted}>—</span>}</span>
            </div>
          ))}
        </div>

        {supplier.isArchived && supplier.archivedAt && (
          <div className={styles.archivedBanner}>
            <span>⚠</span>
            <span>
              Ce supplier a été archivé le{" "}
              {new Date(supplier.archivedAt).toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </span>
          </div>
        )}
      </Card>

      {/* Edit modal */}
      {showEdit && (
        <SupplierFormModal
          mode="edit"
          supplier={supplier}
          onClose={() => setShowEdit(false)}
          onSubmit={handleEdit}
        />
      )}

      {/* Confirm dialog */}
      {confirmAction && (
        <ConfirmDialog
          title={confirmAction === "archive" ? "Archiver le supplier ?" : "Restaurer le supplier ?"}
          message={
            confirmAction === "archive"
              ? <span>Vous êtes sur le point d'archiver <strong>{supplier.legalName}</strong>. Les factures existantes seront conservées, mais le supplier ne sera plus visible par défaut.</span>
              : <span>Vous êtes sur le point de restaurer <strong>{supplier.legalName}</strong>. Le supplier redeviendra visible dans la liste active.</span>
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
