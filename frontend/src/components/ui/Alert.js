import styles from "./Input.module.css";
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