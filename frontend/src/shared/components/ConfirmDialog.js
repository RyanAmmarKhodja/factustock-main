import { useEffect } from "react";
import Button from "./Button";
import styles from "./ConfirmDialog.module.css";

/**
 * Reusable confirmation dialog — Fluent Dialog pattern.
 *
 * @param {string}   title        — Dialog heading
 * @param {string}   message      — Body text (can include JSX)
 * @param {string}   confirmLabel — Text for the confirm button
 * @param {string}   variant      — "danger" | "primary" (confirm button style)
 * @param {boolean}  loading      — Show spinner on confirm button
 * @param {function} onConfirm    — Called when user confirms
 * @param {function} onCancel     — Called when user cancels or clicks backdrop
 */
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirmer",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className={styles.dialog} role="alertdialog" aria-modal="true">
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.message}>{message}</div>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Annuler
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
