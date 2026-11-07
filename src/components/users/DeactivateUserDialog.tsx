
import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

import { userService } from "../../services/userService";
import type { UserResponse } from "../../types/user/UserResponse";

interface DeactivateUserDialogProps {
  user: UserResponse;
  onCancel: () => void;
  onDeactivated: () => void;
}

export default function DeactivateUserDialog({
  user,
  onCancel,
  onDeactivated,
}: DeactivateUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleDeactivate() {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      await userService.deactivateUser(user.id);
      onDeactivated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao desactivar utilizador."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="user-dialog-overlay">
      <div
        className="user-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="deactivate-user-title"
        aria-describedby="deactivate-user-description"
      >
        <div className="user-dialog-heading">
          <div className="user-dialog-icon">
            <AlertTriangle size={23} />
          </div>

          <button
            type="button"
            className="edit-user-close"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Fechar confirmação"
          >
            <X size={19} />
          </button>
        </div>

        <h2 id="deactivate-user-title">
          Desactivar utilizador?
        </h2>

        <p id="deactivate-user-description">
          Tens a certeza de que pretendes desactivar
          a conta de <strong>{user.name}</strong>?
        </p>

        <p className="user-dialog-note">
          A conta ficará inactiva. O acesso deverá ser
          impedido pelo backend após a desactivação.
        </p>

        {error && (
          <p className="change-password-error" role="alert">
            {error}
          </p>
        )}

        <div className="user-dialog-actions">
          <button
            type="button"
            className="edit-user-cancel"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="user-deactivate-confirm"
            onClick={handleDeactivate}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "A desactivar..."
              : "Sim, desactivar"}
          </button>
        </div>
      </div>
    </div>
  );
}
