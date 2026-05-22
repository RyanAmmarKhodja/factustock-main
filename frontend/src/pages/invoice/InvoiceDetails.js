import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInvoice } from "../../api/invoiceApi";
import { PageHeader, Card, CardHeader, Badge, Alert } from "../../components/ui/UI";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import styles from "./InvoiceDetails.module.css";

const STATUS_BADGE = {
  Draft: "neutral", Sent: "primary", Paid: "success",
  Overdue: "danger", Cancelled: "warning",
};
const STATUS_LABEL = {
  Draft: "Brouillon", Sent: "Envoyée", Paid: "Payée",
  Overdue: "En retard", Cancelled: "Annulée",
};
const PAYMENT_LABEL = {
  Cash: "Espèces", BankTransfer: "Virement bancaire", Cheque: "Chèque",
  CIB: "Carte CIB", Edahabia: "Carte Edahabia",
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

const formatDA = (n) =>
  Number(n).toLocaleString("fr-DZ", { minimumFractionDigits: 2 }) + " DA";

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchInvoice = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getInvoice(id);
      setInvoice(res.data);
    } catch {
      setError("Facture introuvable.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchInvoice(); }, [fetchInvoice]);

  const handleDownload = () => {
    if (!invoice?.pdfDownloadUrl) return;
    const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000";
    window.open(apiBase + invoice.pdfDownloadUrl, "_blank");
  };

  if (loading) return <Loading />;
  if (error) return (
    <div>
      <Alert variant="danger">{error}</Alert>
      <Button onClick={() => navigate("/invoices")} style={{ marginTop: 16 }}>
        ← Retour aux factures
      </Button>
    </div>
  );
  if (!invoice) return null;

  return (
    <div>
      <PageHeader
        title={`Facture ${invoice.invoiceNumber}`}
        subtitle={
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {formatDate(invoice.invoiceDate)}
            <Badge variant={STATUS_BADGE[invoice.status] || "neutral"}>
              {STATUS_LABEL[invoice.status] || invoice.status}
            </Badge>
          </span>
        }
        action={
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {invoice.pdfDownloadUrl && (
              <Button onClick={handleDownload}>Télécharger PDF</Button>
            )}
            <Button variant="secondary" onClick={() => navigate("/invoices")}>
              ← Retour
            </Button>
          </div>
        }
      />

      <div className={styles.grid}>

        {/* ── Client ───────────────────────────────────────────── */}
        <Card padding="md">
          <CardHeader title="Client" />
          <div className={styles.infoList}>
            <InfoRow label="Nom légal"  value={invoice.clientLegalName} />
            <InfoRow label="Adresse"    value={invoice.clientAddress} />
            <InfoRow label="Téléphone"  value={invoice.clientTel} />
            <InfoRow label="E-mail"     value={invoice.clientEmail} />
            <InfoRow label="NIF"        value={invoice.clientNIF} />
            <InfoRow label="AI"         value={invoice.clientAI} />
            <InfoRow label="RC"         value={invoice.clientRC} />
            <InfoRow label="NIS"        value={invoice.clientNIS} />
          </div>
        </Card>

        {/* ── Facture info ─────────────────────────────────────── */}
        <Card padding="md">
          <CardHeader title="Informations" />
          <div className={styles.infoList}>
            <InfoRow label="N° Facture"       value={invoice.invoiceNumber} />
            <InfoRow label="Date"             value={formatDate(invoice.invoiceDate)} />
            <InfoRow label="Échéance"         value={formatDate(invoice.dueDate)} />
            <InfoRow label="Mode de paiement" value={PAYMENT_LABEL[invoice.paymentMethod] || invoice.paymentMethod} />
            <InfoRow label="Total HT"         value={formatDA(invoice.totalHorsTaxe)} />
            <InfoRow label="Total TTC"        value={<strong>{formatDA(invoice.ttc)}</strong>} />
            {invoice.notes && <InfoRow label="Notes" value={invoice.notes} />}
          </div>
        </Card>

      </div>

      {/* ── Lignes ───────────────────────────────────────────────── */}
      <Card padding="sm" style={{ marginTop: "var(--space-4)" }}>
        <CardHeader title="Lignes de facture" />
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Désignation</th>
                <th>Réf.</th>
                <th>Qté</th>
                <th>Unité</th>
                <th>P.U. HT</th>
                <th>TVA %</th>
                <th>Total HT</th>
                <th>Total TTC</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className={styles.designation}>{item.designation}</td>
                  <td className={styles.muted}>{item.code || "—"}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit || "—"}</td>
                  <td>{formatDA(item.pricePerUnit)}</td>
                  <td>{item.tva}%</td>
                  <td>{formatDA(item.priceHorsTaxe)}</td>
                  <td className={styles.amount}>{formatDA(item.priceTTC)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} />
                <td className={styles.totalLabel}>Total HT</td>
                <td className={styles.totalValue}>{formatDA(invoice.totalHorsTaxe)}</td>
              </tr>
              <tr className={styles.totalTTCRow}>
                <td colSpan={6} />
                <td className={styles.totalLabel}>Total TTC</td>
                <td className={styles.totalValue}>{formatDA(invoice.ttc)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value || <span className={styles.muted}>—</span>}</span>
    </div>
  );
}
