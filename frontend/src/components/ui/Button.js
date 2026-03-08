import styles from "./Button.module.css";

/**
 
* variant: "primary" | "secondary" | "danger" | "ghost"
 * size: "sm" | "md" | "lg"
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  type = "button",
  onClick,
  ...rest
}) {
  return (
    <button
      type={type}
      className={[
        styles.btn,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : "",
        loading   ? styles.loading   : "",
      ].join(" ")}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading ? (
        <span className={styles.spinner} aria-label="Loading" />
      ) : null}
      <span className={loading ? styles.hiddenText : ""}>{children}</span>
    </button>
  );
}