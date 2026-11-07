import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import CreateUserForm from "../components/users/CreateUserForm";
import EditUserForm from "../components/users/EditUserForm";
import UsersTable from "../components/users/UsersTable";
import DeactivateUserDialog from "../components/users/DeactivateUserDialog";
import ActivateUserDialog from "../components/users/ActivateUserDialog";
import ResetPasswordDialog from "../components/users/ResetPasswordDialog";

import type { UserResponse } from "../types/user/UserResponse";

export default function UsersPage() {
  const [createdUser, setCreatedUser] = useState<UserResponse | null>(null);

  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [deactivatingUser, setDeactivatingUser] = useState<UserResponse | null>(
    null,
  );
  const [activatingUser, setActivatingUser] = useState<UserResponse | null>(
    null,
  );
  const [resetPasswordUser, setResetPasswordUser] =
    useState<UserResponse | null>(null);

  function refreshUsers() {
    setRefreshKey((current) => current + 1);
  }

  function handleUserCreated(user: UserResponse) {
    setCreatedUser(user);
    setSuccessMessage("");
    refreshUsers();
  }

  function handleEdit(user: UserResponse) {
    setEditingUser(user);
    setCreatedUser(null);
    setSuccessMessage("");
  }

  function handleUserUpdated() {
    setEditingUser(null);
    setCreatedUser(null);
    setSuccessMessage("Utilizador actualizado com sucesso!");
    refreshUsers();
  }

  function handleDeactivate(user: UserResponse) {
    setDeactivatingUser(user);
    setSuccessMessage("");
    setCreatedUser(null);
  }

  function handleUserDeactivated() {
    setDeactivatingUser(null);
    setEditingUser(null);
    setCreatedUser(null);

    setSuccessMessage("Utilizador desactivado com sucesso!");

    refreshUsers();
  }

  function handleActivate(user: UserResponse) {
    setActivatingUser(user);
    setSuccessMessage("");
    setCreatedUser(null);
  }

  function handleUserActivated() {
    setActivatingUser(null);
    setEditingUser(null);
    setCreatedUser(null);

    setSuccessMessage("Utilizador activado com sucesso!");

    refreshUsers();
  }

  function handleResetPassword(user: UserResponse) {
    setResetPasswordUser(user);
    setSuccessMessage("");
    setCreatedUser(null);
  }

  function handlePasswordReset() {
    // A credencial temporária permanece apenas
    // dentro do ResetPasswordDialog.
    refreshUsers();
  }

  return (
    <div className="users-page">
      <div className="dashboard-heading">
        <h1>Gestão de Utilizadores</h1>
        <p>Administração das contas de acesso ao SGN.</p>
      </div>

      {successMessage && (
        <div className="user-created-success" role="status">
          <CheckCircle2 size={22} />
          <strong>{successMessage}</strong>
        </div>
      )}

      {createdUser && (
        <div className="user-created-success" role="status">
          <CheckCircle2 size={22} />

          <div>
            <strong>Utilizador criado com sucesso!</strong>

            <p>
              {createdUser.name} ({createdUser.username})
            </p>
          </div>
        </div>
      )}
      <UsersTable
        refreshKey={refreshKey}
        onEdit={handleEdit}
        onDeactivate={handleDeactivate}
        onActivate={handleActivate}
        onResetPassword={handleResetPassword}
      />

      {editingUser ? (
        <EditUserForm
          key={editingUser.id}
          user={editingUser}
          onCancel={() => setEditingUser(null)}
          onUpdated={handleUserUpdated}
        />
      ) : (
        <CreateUserForm onCreated={handleUserCreated} />
      )}
      {deactivatingUser && (
        <DeactivateUserDialog
          user={deactivatingUser}
          onCancel={() => setDeactivatingUser(null)}
          onDeactivated={handleUserDeactivated}
        />
      )}

      {activatingUser && (
        <ActivateUserDialog
          user={activatingUser}
          onCancel={() => setActivatingUser(null)}
          onActivated={handleUserActivated}
        />
      )}
      {resetPasswordUser && (
        <ResetPasswordDialog
          key={resetPasswordUser.id}
          user={resetPasswordUser}
          onClose={() => setResetPasswordUser(null)}
          onReset={handlePasswordReset}
        />
      )}
    </div>
  );
}
