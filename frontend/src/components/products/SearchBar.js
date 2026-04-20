import { useState, useEffect, useRef } from "react";
import styles from "./SearchBar.module.css";

/**
 * Search input + filter dropdowns for the products list.
 * Debounced search — calls onSearch(params) after typing stops.
 *
 * @param {function} onSearch — Called with { search, type, includeArchived }
 */
export default function SearchBar({ onSearch }) {
  const [search, setSearch]               = useState("");
  const [type, setType]                   = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const debounceRef = useRef(null);

  // Debounced search — fires after 350ms of inactivity
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch({
        search: search.trim() || undefined,
        includeArchived,
      });
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [search, type, includeArchived]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.bar}>
      {/* Search input */}
      <div className={styles.searchWrapper}>
        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Rechercher un product…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            className={styles.clearBtn}
            onClick={() => setSearch("")}
            aria-label="Effacer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
            className={styles.checkbox}
          />
          <span>Inclure archivés</span>
        </label>
      </div>
    </div>
  );
}
