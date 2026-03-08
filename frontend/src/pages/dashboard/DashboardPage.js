import { useAuth } from "../../context/AuthContext";
import { PageHeader, StatCard, Card, CardHeader } from "../../components/ui/UI";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${user?.firstName} !`}
        subtitle="Voici un aperçu de votre activité aujourd'hui."
      />

      {/* Stat cards — will be populated with real API data in the invoicing module */}
      <div className={styles.statsGrid}>
        <StatCard
          label="Factures du mois"
          value="—"
          sub="Module factures à venir"
          color="primary"
          icon="📄"
        />
        <StatCard
          label="Montant encaissé"
          value="—"
          sub="Module paiements à venir"
          color="success"
          icon="💰"
        />
        <StatCard
          label="Factures en retard"
          value="—"
          sub="Module notifications à venir"
          color="danger"
          icon="⚠️"
        />
        <StatCard
          label="Produits en stock bas"
          value="—"
          sub="Module stock à venir"
          color="warning"
          icon="📦"
        />
      </div>

      {/* Quick actions */}
      <div className={styles.quickGrid}>
        <Card padding="md">
          <CardHeader
            title="Accès rapide"
            subtitle="Les actions les plus fréquentes"
          />
          <div className={styles.quickLinks}>
            {[
              { label: "Nouvelle facture",    icon: "📄", to: "/factures/nouvelle" },
              { label: "Ajouter un client",   icon: "👤", to: "/clients/nouveau"   },
              { label: "Ajouter un produit",  icon: "📦", to: "/produits/nouveau"  },
            ].map(item => (
              <a key={item.to} href={item.to} className={styles.quickLink}>
                <span className={styles.quickIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </Card>

        <Card padding="md">
          <CardHeader
            title="Activité récente"
            subtitle="Dernières actions enregistrées"
          />
          <div className={styles.emptyActivity}>
            <span>🕐</span>
            <p>L'historique d'activité apparaîtra ici une fois les modules configurés.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}