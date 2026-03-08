import Sidebar from "./Sidebar";
import styles from "./ClientLayout.module.css";

export default function ClientLayout({ children }) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}