import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBon } from "../api/bonApi";
import api from "../../../shared/api/api";
import { PageHeader, Card, CardHeader, Badge, Alert } from "../../../shared/components/UI";
import Button from "../../../shared/components/Button";
import Loading from "../../../shared/components/Loading";
import styles from "../styles/BonDetails.module.css";

const typeLabel = (t) => {
  if (t === "BonLivraison") return "Bon de Livraison";
  if (t === "BonReception") return "Bon de Réception";
  if (t === "BonCommande")  return "Bon de Commande";
  return t;
};

const typeBadge = (t) => {
  if (t === "BonLivraison") return "primary";
  if (t === "BonReception") return "success";
  return "neutral";
};

export default function BonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bon, setBon]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    getBon(id)
      .then((res) => setBon(res.data))
      .catch(() => setError("Impossible de charger les détails du bon."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    if (!bon?.pdfDownloadUrl) return;
    const path = bon.pdfDownloadUrl.replace(/^\/api/, "");
    const res = await api.get(path, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `bon-${bon.bonNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <Loading />;

  if (error) return (
    <div>
      <Alert variant="danger">{error}</Alert>
      <Button variant="secondary" onClick={() => navigate("/documents")}>← Retour</Button>
    </div>
  );

  return (
    <div>
      <PageHeader
        title={`${typeLabel(bon.bonType)} — ${bon.bonNumber}`}
        subtitle={`Créé le ${new Date(bon.createdAt).toLocaleDateString("fr-DZ")} par ${bon.createdByUser}`}
        action={
          <div className={styles.headerActions}>
            <Button variant="secondary" onClick={() => navigate("/documents")}>← Retour</Button>
            <Button onClick={handleDownload}>Télécharger le PDF</Button>
          </div>
        }
      />

      <div className={styles.grid}>
        {/* Client / Destinataire */}
        <Card padding="md">
          <CardHeader title="Destinataire" />
          <dl className={styles.dl}>
            <dt>Raison sociale</dt>
            <dd>{bon.clientLegalName || <span className={styles.muted}>—</span>}</dd>
            {bon.clientAddress && <><dt>Adresse</dt><dd>{bon.clientAddress}</dd></>}
            {bon.clientTel      && <><dt>Téléphone</dt><dd>{bon.clientTel}</dd></>}
            {bon.clientNIF      && <><dt>NIF</dt><dd>{bon.clientNIF}</dd></>}
            {bon.clientAI       && <><dt>AI</dt><dd>{bon.clientAI}</dd></>}
            {bon.clientRC       && <><dt>RC</dt><dd>{bon.clientRC}</dd></>}
            {bon.clientNIS      && <><dt>NIS</dt><dd>{bon.clientNIS}</dd></>}
          </dl>
        </Card>

        {/* Bon info */}
        <Card padding="md">
          <CardHeader title="Informations du bon" />
          <dl className={styles.dl}>
            <dt>Numéro</dt>
            <dd className={styles.bold}>{bon.bonNumber}</dd>
            <dt>Type</dt>
            <dd><Badge variant={typeBadge(bon.bonType)}>{typeLabel(bon.bonType)}</Badge></dd>
            <dt>Date</dt>
            <dd>{new Date(bon.bonDate).toLocaleDateString("fr-DZ")}</dd>
            <dt>Total HT</dt>
            <dd>{bon.totalHorsTaxe.toLocaleString("fr-DZ", { minimumFractionDigits: 2 })} DA</dd>
            <dt>Total TTC</dt>
            <dd className={styles.ttc}>{bon.ttc.toLocaleString("fr-DZ", { minimumFractionDigits: 2 })} DA</dd>
            {bon.notes && <><dt>Observations</dt><dd className={styles.notes}>{bon.notes}</dd></>}
          </dl>
        </Card>
      </div>

      {/* Line items */}
      <Card padding="sm" className={styles.linesCard}>
        <CardHeader title="Articles" subtitle={`${bon.items.length} ligne${bon.items.length !== 1 ? "s" : ""}`} />
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Désignation</th>
                <th>Référence</th>
                <th>Qté</th>
                <th>Unité</th>
                <th>P.U. HT</th>
                <th>TVA %</th>
                <th>Total HT</th>
                <th>Total TTC</th>
              </tr>
            </thead>
            <tbody>
              {bon.items.map((item) => (
                <tr key={item.id}>
                  <td className={styles.desig}>{item.designation}</td>
                  <td className={styles.ref}>{item.code || <span className={styles.muted}>—</span>}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit || <span className={styles.muted}>—</span>}</td>
                  <td>{item.pricePerUnit.toLocaleString("fr-DZ", { minimumFractionDigits: 2 })} DA</td>
                  <td>{item.tva}%</td>
                  <td>{item.priceHorsTaxe.toLocaleString("fr-DZ", { minimumFractionDigits: 2 })} DA</td>
                  <td className={styles.bold}>{item.priceTTC.toLocaleString("fr-DZ", { minimumFractionDigits: 2 })} DA</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={styles.totalRow}>
                <td colSpan={6} className={styles.totalLabel}>Total HT</td>
                <td colSpan={2} className={styles.totalValue}>
                  {bon.totalHorsTaxe.toLocaleString("fr-DZ", { minimumFractionDigits: 2 })} DA
                </td>
              </tr>
              <tr className={styles.totalRowTTC}>
                <td colSpan={6} className={styles.totalLabel}>Total TTC</td>
                <td colSpan={2} className={styles.totalValueTTC}>
                  {bon.ttc.toLocaleString("fr-DZ", { minimumFractionDigits: 2 })} DA
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
