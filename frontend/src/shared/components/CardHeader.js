import styles from "./Input.module.css";
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