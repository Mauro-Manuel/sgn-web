
import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";

import { userService } from "../../services/userService";
import type { UserResponse } from "../../types/user/UserResponse";

interface ActivateUserDialogProps {
  user: UserResponse;
  onCancel: () => void;
  onActivated: () => void;
}

export default function ActivateUserDialog({
  user,
  onCancel,
  onActivated,
}: ActivateUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleActivate() {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      await userService.activateUser(user.id);
      onActivated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao activar utilizador."
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
        aria-labelledby="activate-user-title"
        aria-describedby="activate-user-description"
      >
        <div className="user-dialog-heading">
          <div className="user-dialog-activate-icon">
            <CheckCircle2 size={23} />
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

        <h2 id="activate-user-title">
          Activar utilizador?
        </h2>

        <p id="activate-user-description">
          Tens a certeza de que pretendes activar
          a conta de <strong>{user.name}</strong>?
        </p>

        <p className="user-dialog-note">
          A conta ficará activa e poderá voltar
          a autenticar-se, desde que cumpra
          os restantes requisitos de acesso.
        </p>

        {error && (
          <p
            className="change-password-error"
            role="alert"
          >
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
            className="user-activate-confirm"
            onClick={handleActivate}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "A activar..."
              : "Sim, activar"}
          </button>
        </div>
      </div>
    </div>
  );
}
