import { useState, useEffect, useCallback } from "react";
import { getUsers, registerEmployee, updateUser, deactivateUser } from "../../api/authApi";
import { PageHeader, Card, CardHeader, Badge, Alert, Spinner } from "../../components/ui/UI";
import Button from "../../components/ui/Button";
import UserFormModal from "../../components/users/UserFormModal";
import styles from "./UsersPage.module.css";

export default function UsersPage() {
  const [users, setUsers]         = useState([]);
  const [maxAllowed, setMaxAllowed] = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser]         = useState(null);  // user obj or null

  // Confirm deactivate
  const [confirmDeactivate, setConfirmDeactivate] = useState(null); // user obj or null

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getUsers();
      setUsers(res.data.users);
      setMaxAllowed(res.data.maxAllowed);
    } catch {
      setError("Impossible de charger les utilisateurs. Réessayez.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCreate = async (formData) => {
    await registerEmployee(formData);
    setSuccess("Employé créé avec succès.");
    fetchUsers();
  };

  const handleEdit = async (formData) => {
    await updateUser(editingUser.id, formData);
    setSuccess("Utilisateur mis à jour.");
    fetchUsers();
  };

  const handleDeactivate = async () => {
    if (!confirmDeactivate) return;
    try {
      await deactivateUser(confirmDeactivate.id);
      setSuccess("Compte désactivé. Le siège est maintenant disponible.");
      setConfirmDeactivate(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de désactiver ce compte.");
      setConfirmDeactivate(null);
    }
  };

  // ── Computed ───────────────────────────────────────────────────────────────
  const activeCount   = users.filter(u => u.active).length;
  const seatsUsed     = activeCount;
  const seatsLeft     = maxAllowed - seatsUsed;
  const canAddMore    = seatsLeft > 0;

  const roleLabel = (role) => role === "admin" ? "Administrateur" : "Employé";
  const roleBadge = (role) => role === "admin" ? "primary" : "neutral";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Gestion des utilisateurs"
        subtitle="Gérez les comptes employés et les accès au logiciel."
        action={
          <Button
            onClick={() => setShowCreateModal(true)}
            disabled={!canAddMore}
            title={!canAddMore ? "Limite de sièges atteinte. Désactivez un compte pour en ajouter un autre." : ""}
          >
            + Ajouter un employé
          </Button>
        }
      />

      {/* Seat usage bar */}
      <Card className={styles.seatCard} padding="md">
        <div className={styles.seatInfo}>
          <div>
            <span className={styles.seatTitle}>Utilisation des sièges</span>
            <span className={styles.seatCount}>
              <strong>{seatsUsed}</strong> / {maxAllowed} comptes actifs
            </span>
          </div>
          <span className={seatsLeft > 1 ? styles.seatGood : seatsLeft === 1 ? styles.seatWarn : styles.seatFull}>
            {seatsLeft > 0 ? `${seatsLeft} siège${seatsLeft > 1 ? "s" : ""} disponible${seatsLeft > 1 ? "s" : ""}` : "Limite atteinte"}
          </span>
        </div>
        <div className={styles.seatBar}>
          <div
            className={styles.seatBarFill}
            style={{
              width: `${Math.min((seatsUsed / maxAllowed) * 100, 100)}%`,
              background: seatsLeft === 0 ? "var(--color-danger)" : seatsLeft === 1 ? "var(--color-warning)" : "var(--color-primary)",
            }}
          />
        </div>
      </Card>

      {/* Feedback messages */}
      {error   && <Alert variant="danger"  onDismiss={() => setError("")}   >{error}</Alert>}
      {success && <Alert variant="success" onDismiss={() => setSuccess("")} >{success}</Alert>}

      {/* Users table */}
      <Card padding="sm" className={styles.tableCard}>
        <CardHeader
          title="Tous les utilisateurs"
          subtitle={`${users.length} compte${users.length !== 1 ? "s" : ""} enregistré${users.length !== 1 ? "s" : ""}`}
        />

        {loading ? (
          <Spinner />
        ) : users.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>👤</span>
            <p>Aucun utilisateur trouvé.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nom complet</th>
                  <th>Adresse e-mail</th>
                  <th>Téléphone</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Dernière connexion</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user.id} className={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                    <td className={styles.nameCell}>
                      <div className={styles.avatar}>
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <span>{user.firstName} {user.lastName}</span>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || <span className={styles.empty_val}>—</span>}</td>
                    <td><Badge variant={roleBadge(user.role)}>{roleLabel(user.role)}</Badge></td>
                    <td>
                      <Badge variant={user.active ? "success" : "neutral"}>
                        {user.active ? "Actif" : "Inactif"}
                      </Badge>
                    </td>
                    <td className={styles.dateCell}>
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString("fr-DZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
                        : <span className={styles.empty_val}>Jamais connecté</span>
                      }
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          Modifier
                        </Button>
                        {user.role !== "admin" && user.active && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setConfirmDeactivate(user)}
                          >
                            Désactiver
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create modal */}
      {showCreateModal && (
        <UserFormModal
          mode="create"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
        />
      )}

      {/* Edit modal */}
      {editingUser && (
        <UserFormModal
          mode="edit"
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={handleEdit}
        />
      )}

      {/* Deactivate confirm */}
      {confirmDeactivate && (
        <div className={styles.confirmBackdrop} onClick={(e) => { if (e.target === e.currentTarget) setConfirmDeactivate(null); }}>
          <div className={styles.confirmBox}>
            <h3 className={styles.confirmTitle}>Désactiver le compte ?</h3>
            <p className={styles.confirmText}>
              Vous êtes sur le point de désactiver le compte de{" "}
              <strong>{confirmDeactivate.firstName} {confirmDeactivate.lastName}</strong>.
              Cette personne ne pourra plus se connecter. Le siège sera libéré.
            </p>
            <div className={styles.confirmActions}>
              <Button variant="secondary" onClick={() => setConfirmDeactivate(null)}>
                Annuler
              </Button>
              <Button variant="danger" onClick={handleDeactivate}>
                Oui, désactiver
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}