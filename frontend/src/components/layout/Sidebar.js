import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import styles from "./Sidebar.module.css";

// Icons as simple SVG components to avoid a full icon library dependency
const Icons = {
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Package: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  Invoice: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Clients: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  AuditLog: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M20 12h2M2 12h2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41"/>
    </svg>
  ),
  Supplier: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M20 12h2M2 12h2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41"/>
    </svg>
  )
};

// Navigation items — some are admin-only
const NAV_ITEMS = [
  { to: "/",          label: "Accueil", icon: "Dashboard", adminOnly: false },
  { to: "/clients",   label: "Clients",          icon: "Clients",  adminOnly: false },
  { to: "/products",  label: "Produits",          icon: "Package",  adminOnly: false },
  { to: "/invoices",  label: "Factures",          icon: "Invoice",  adminOnly: false },
  { to: "/users", label: "Utilisateurs",   icon: "Users",    adminOnly: true  },
  { to: "/logs",   label: "Journal d'audit",   icon: "AuditLog", adminOnly: true  },
  { to: "/settings",label: "Paramètres",        icon: "Settings", adminOnly: false },
  { to: "/suppliers",label: "Fournisseurs",        icon: "Supplier", adminOnly: false },
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