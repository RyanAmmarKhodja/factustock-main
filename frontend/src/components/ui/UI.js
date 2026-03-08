import styles from "./UI.module.css";

// ─────────────────────────────────────────────
// BADGE  — colored status pill
// variant: "success" | "danger" | "warning" | "primary" | "neutral"
// ─────────────────────────────────────────────
export function Badge({ children, variant = "neutral" }) {
  return (
    <span className={[styles.badge, styles[`badge_${variant}`]].join(" ")}>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────
// CARD  — soft white container with shadow
// ─────────────────────────────────────────────
export function Card({ children, className = "", padding = "md" }) {
  return (
    <div className={[styles.card, styles[`card_${padding}`], className].join(" ")}>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// CARD HEADER  — title row inside a card
// ─────────────────────────────────────────────
export function CardHeader({ title, subtitle, action }) {
  return (
    <div className={styles.cardHeader}>
      <div>
        <h2 className={styles.cardTitle}>{title}</h2>
        {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
      </div>
      {action && <div className={styles.cardAction}>{action}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// ALERT  — dismissible feedback banner
// variant: "success" | "danger" | "warning" | "info"
// ─────────────────────────────────────────────
export function Alert({ children, variant = "info", onDismiss }) {
  const icons = {
    success: "✓",
    danger:  "✕",
    warning: "⚠",
    info:    "ℹ",
  };
  return (
    <div className={[styles.alert, styles[`alert_${variant}`]].join(" ")} role="alert">
      <span className={styles.alertIcon}>{icons[variant]}</span>
      <span className={styles.alertText}>{children}</span>
      {onDismiss && (
        <button className={styles.alertDismiss} onClick={onDismiss} aria-label="Fermer">
          ✕
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// STAT CARD  — dashboard metric tile
// ─────────────────────────────────────────────
export function StatCard({ label, value, sub, color = "primary", icon }) {
  return (
    <div className={[styles.statCard, styles[`statCard_${color}`]].join(" ")}>
      {icon && <div className={styles.statIcon}>{icon}</div>}
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// PAGE HEADER  — consistent top of every page
// ─────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// SPINNER  — loading state
// ─────────────────────────────────────────────
export function Spinner({ size = "md", label = "Chargement..." }) {
  return (
    <div className={styles.spinnerWrapper} aria-label={label}>
      <div className={[styles.spinner, styles[`spinner_${size}`]].join(" ")} />
    </div>
  );
}