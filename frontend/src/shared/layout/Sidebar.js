import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import styles from "./Sidebar.module.css";
import { Settings, Truck, History, Users, FileText, Package, User, House, FolderOpen, LogOut } from "lucide-react";

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
  ),
  Documents: () => (
    <FolderOpen />
  ),
};

// Navigation items — some are admin-only
const NAV_ITEMS = [
  { to: "/",          label: "Accueil", icon: "Dashboard", adminOnly: false },
  { to: "/clients",   label: "Clients",          icon: "Clients",  adminOnly: false },
  { to: "/products",  label: "Produits",          icon: "Package",  adminOnly: false },
  { to: "/invoices",  label: "Factures",          icon: "Invoice",  adminOnly: false },
  { to: "/suppliers",label: "Fournisseurs",        icon: "Supplier", adminOnly: false },
  { to: "/utilisateurs", label: "Utilisateurs",        icon: "Users",    adminOnly: true  },
  { to: "/documents",    label: "Documents",            icon: "Documents",adminOnly: false },
  { to: "/logs",         label: "Journal d'activités", icon: "AuditLog", adminOnly: false },
  { to: "/settings",     label: "Paramètres",          icon: "Settings", adminOnly: false },
  
];

export default function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const handleKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [menuOpen]);

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
      <div className={styles.userSection} ref={menuRef}>
        {/* Popup menu — appears above the badge */}
        {menuOpen && (
          <div className={styles.userMenu}>
            <button
              className={styles.userMenuItem}
              onClick={() => { logout(); setMenuOpen(false); }}
            >
              <LogOut size={15} />
              <span>Se déconnecter</span>
            </button>
          </div>
        )}

        {/* Clickable user badge */}
        <button
          className={`${styles.userInfo} ${menuOpen ? styles.userInfoActive : ""}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-haspopup="true"
          aria-expanded={menuOpen}
        >
          <div className={styles.userAvatar}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{user?.firstName} {user?.lastName}</span>
            <span className={styles.userRole}>
              {user?.role === "admin" ? "Administrateur" : "Employé"}
            </span>
          </div>
          <span className={styles.userChevron}>{menuOpen ? "▲" : "▼"}</span>
        </button>
      </div>
    </aside>
  );
}