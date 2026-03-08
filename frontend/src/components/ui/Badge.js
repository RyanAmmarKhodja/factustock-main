import styles from "./Input.module.css";
export function Badge({ children, variant = "neutral" }) {
  return (
    <span className={[styles.badge, styles[`badge_${variant}`]].join(" ")}>
      {children}
    </span>
  );
}