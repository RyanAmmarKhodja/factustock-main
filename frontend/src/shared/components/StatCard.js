import styles from "./Input.module.css";
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