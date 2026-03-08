import styles from "./Input.module.css";
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