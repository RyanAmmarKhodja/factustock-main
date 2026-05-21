// import { useState, useEffect, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { getInvoice, updateInvoice, archiveInvoice, restoreInvoice } from "../../api/invoiceApi";
// import { PageHeader, Card, Badge, Alert } from "../../components/ui/UI";
// import Button from "../../components/ui/Button";
// import Loading from "../../components/ui/Loading";
// import ConfirmDialog from "../../components/ui/ConfirmDialog";
// import InvoiceFormModal from "../../components/invoices/InvoiceFormModal";
// import styles from "./InvoiceDetails.module.css";

// const typeLabel = (t) => (t === 1 || t === "Company") ? "Entreprise" : "Particulier";

// export default function InvoiceDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [invoice, setInvoice]         = useState(null);
//   const [loading, setLoading]       = useState(true);
//   const [error, setError]           = useState("");
//   const [success, setSuccess]       = useState("");
//   const [showEdit, setShowEdit]     = useState(false);
//   const [confirmAction, setConfirmAction] = useState(null); // "archive" | "restore" | null

//   const fetchInvoice = useCallback(async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await getInvoice(id);
//       setInvoice(res.data);
//     } catch {
//       setError("Invoice introuvable.");
//     } finally {
//       setLoading(false);
//     }
//   }, [id]);

//   useEffect(() => { fetchInvoice(); }, [fetchInvoice]);

//   // Edit
//   const handleEdit = async (formData) => {
//     await updateInvoice(id, formData);
//     setSuccess("Invoice mis à jour avec succès.");
//     fetchInvoice();
//   };

//   // Archive / Restore
//   const handleArchiveRestore = async () => {
//     try {
//       if (confirmAction === "archive") {
//         await archiveInvoice(id);
//         setSuccess("Invoice archivé avec succès.");
//       } else {
//         await restoreInvoice(id);
//         setSuccess("Invoice restauré avec succès.");
//       }
//       setConfirmAction(null);
//       fetchInvoice();
//     } catch (err) {
//       setError(err.response?.data?.message || "Une erreur s'est produite.");
//       setConfirmAction(null);
//     }
//   };

//   if (loading) return <Loading />;
//   if (error && !invoice) {
//     return (
//       <div>
//         <Alert variant="danger">{error}</Alert>
//         <Button variant="primary" size="md" onClick={() => navigate("/invoices")} style={{ marginTop: 16 }}>
//           ← Retour aux invoices
//         </Button>
//       </div>
//     );
//   }
//   if (!invoice) return null;

//   const infoFields = [
//     { label: "Code Produit", value: invoice.code },
//     { label: "Code-barres", value: invoice.barcode },
//     { label: "Désignation", value: invoice.name },
//     { label: "Catégorie", value: invoice.category },
//     { label: "Description", value: invoice.description },
//     { label: "Prix de vente", value: invoice.price?.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' }) },
//     { label: "Unité", value: invoice.unit },
//     { label: "Taux TVA par défaut", value: invoice.defaultTaxRate ? `${invoice.defaultTaxRate}%` : "0%" },
//     { label: "Quantité en stock", value: invoice.stockQuantity },
//     { label: "Seuil d'alerte", value: invoice.minStockLevel },
//     { 
//       label: "Créé le", 
//       value: new Date(invoice.createdAt).toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit", year: "numeric" }) 
//     },
//   ];

//   return (
//     <div>
//       <PageHeader
//         title={invoice.name}
//         subtitle={
//           <span className={styles.subtitleRow}>
//             Code: {invoice.code}
//             {!invoice.active && <Badge variant="warning">Archivé</Badge>}
//             {invoice.lowStock && <Badge variant="danger">Stock Faible</Badge>}
//           </span>
//         }
//         action={
//           <Button variant="primary" size="md" onClick={() => navigate("/invoices")}>
//             ← Retour aux produits
//           </Button>
//         }
//       />

//       {error   && <Alert variant="danger"  onDismiss={() => setError("")}>{error}</Alert>}
//       {success && <Alert variant="success" onDismiss={() => setSuccess("")}>{success}</Alert>}

//       {/* Action buttons */}
//       <div className={styles.actionBar}>
//         <Button onClick={() => setShowEdit(true)}>
//           Modifier
//         </Button>
//         <Button
//           variant={!invoice.active ? "primary" : "danger"}
//           onClick={() => setConfirmAction(!invoice.active ? "restore" : "archive")}
//         >
//           {!invoice.active ? "Restaurer" : "Archiver"}
//         </Button>
//         <Button variant="secondary" onClick={() => navigate(`/invoices/${id}/stock-history`)}>
//           Historique de stock
//         </Button>
//       </div>

//       {/* Invoice info */}
//       <Card padding="md" className={styles.infoCard}>
//         <div className={styles.infoGrid}>
//           {infoFields.map((field) => (
//             <div key={field.label} className={styles.infoItem}>
//               <span className={styles.infoLabel}>{field.label}</span>
//               <span className={styles.infoValue}>
//                 {field.value !== null && field.value !== undefined && field.value !== "" 
//                   ? field.value 
//                   : <span className={styles.muted}>—</span>}
//               </span>
//             </div>
//           ))}
//         </div>

//         {!invoice.active && (
//           <div className={styles.archivedBanner}>
//             <span>⚠</span>
//             <span>
//               Ce produit est actuellement archivé et ne figurera pas dans les listes de vente actives.
//             </span>
//           </div>
//         )}
//       </Card>

//       {/* Edit modal */}
//       {showEdit && (
//         <InvoiceFormModal
//           mode="edit"
//           invoice={invoice}
//           onClose={() => setShowEdit(false)}
//           onSubmit={handleEdit}
//         />
//       )}

//       {/* Confirm dialog */}
//       {confirmAction && (
//         <ConfirmDialog
//           title={confirmAction === "archive" ? "Archiver le produit ?" : "Restaurer le produit ?"}
//           message={
//             confirmAction === "archive"
//               ? <span>Vous êtes sur le point d'archiver <strong>{invoice.name}</strong>. Il ne sera plus disponible pour de nouvelles transactions.</span>
//               : <span>Vous êtes sur le point de restaurer <strong>{invoice.name}</strong>. Le produit sera de nouveau disponible dans le catalogue.</span>
//           }
//           confirmLabel={confirmAction === "archive" ? "Oui, archiver" : "Oui, restaurer"}
//           variant={confirmAction === "archive" ? "danger" : "primary"}
//           onConfirm={handleArchiveRestore}
//           onCancel={() => setConfirmAction(null)}
//         />
//       )}
//     </div>
//   )};
