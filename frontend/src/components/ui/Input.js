import styles from "./Input.module.css";

/**
 * Large, clear inputs designed for 40-60 year old users.
 * Always shows a visible label above the field.
 */
export default function Input({
  label,
  id,
  error,
  hint,
  type = "text",
  required = false,
  ...rest
}) {
  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required}> *</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={[styles.input, error ? styles.inputError : ""].join(" ")}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...rest}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className={styles.hint}>{hint}</p>
      )}
      {error && (
        <p id={`${id}-error`} className={styles.error} role="alert">
          <span aria-hidden="true">⚠ </span>{error}
        </p>
      )}
    </div>
  );
}