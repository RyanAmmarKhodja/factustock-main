import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import styles from "./Sidebar.module.css";
import { Settings, Truck, History, Users, FileText, Package, User, House } from "lucide-react";

// Icons as simple SVG components to avoid a full icon library dependency
const Icons = {
  Dashboard: () => (
    <House />
  ),
  Users: () => (
    <Users />
  ),
  Package: () => (
    <Package />
  ),
  Invoice: () => (
    <FileText />
  ),
  Clients: () => (
    <User />
  ),
  AuditLog: () => (
    <History />
  ),
  Settings: () => (
    <Settings />
  ),
  Supplier: () => (
    <Truck />
  )


};

// Navigation items — some are admin-only
const NAV_ITEMS = [
  { to: "/",          label: "Accueil", icon: "Dashboard", adminOnly: false },
  { to: "/clients",   label: "Clients",          icon: "Clients",  adminOnly: false },
  { to: "/products",  label: "Produits",          icon: "Package",  adminOnly: false },
  { to: "/invoices",  label: "Factures",          icon: "Invoice",  adminOnly: false },
  { to: "/suppliers",label: "Fournisseurs",        icon: "Supplier", adminOnly: false },
  { to: "/users", label: "Utilisateurs",   icon: "Users",    adminOnly: true  },
  { to: "/logs",   label: "Journal d'activités",   icon: "AuditLog", adminOnly: true  },
  { to: "/settings",label: "Paramètres",        icon: "Settings", adminOnly: false },
  
];

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>FS</div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>FactuStock</span>
          <span className={styles.brandSub}>Gestion d'entreprise</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav} aria-label="Navigation principale">
        <ul className={styles.navList}>
          {NAV_ITEMS.filter(item => !item.adminOnly || isAdmin).map((item) => {
            const Icon = Icons[item.icon];
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    [styles.navLink, isActive ? styles.navLinkActive : ""].join(" ")
                  }
                >
                  <span className={styles.navIcon}><Icon /></span>
                  <span className={styles.navLabel}>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className={styles.userSection}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{user?.firstName} {user?.lastName}</span>
            <span className={styles.userRole}>
              {user?.role === "admin" ? "Administrateur" : "Employé"}
            </span>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={logout} title="Se déconnecter">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Déconnecter</span>
        </button>
      </div>
    </aside>
  );
}