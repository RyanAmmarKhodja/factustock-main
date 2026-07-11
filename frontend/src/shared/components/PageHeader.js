import styles from "./Input.module.css";
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