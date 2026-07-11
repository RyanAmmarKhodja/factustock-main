import styles from "./Input.module.css";
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