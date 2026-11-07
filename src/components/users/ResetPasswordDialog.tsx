
import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  KeyRound,
  X,
} from "lucide-react";

import { userService } from "../../services/userService";
import type { UserResponse } from "../../types/user/UserResponse";

interface ResetPasswordDialogProps {
  user: UserResponse;
  onClose: () => void;
  onReset: () => void;
}

export default function ResetPasswordDialog({
  user,
  onClose,
  onReset,
}: ResetPasswordDialogProps) {
  const [temporaryPassword, setTemporaryPassword] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleReset() {
    if (isSubmitting || temporaryPassword !== null) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await userService.resetPassword(user.id);

      setTemporaryPassword(result.temporaryPassword);
      onReset();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao repor a palavra-passe."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopy() {
    if (!temporaryPassword) return;

    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
    } catch {
      setError(
        "Não foi possível copiar. Selecciona a credencial manualmente."
      );
    }
  }

  function handleClose() {
    setTemporaryPassword(null);
    setCopied(false);
    setError("");
    onClose();
  }

  return (
    <div className="user-dialog-overlay">
      <div
        className="user-dialog reset-password-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-password-title"
        aria-describedby="reset-password-description"
      >
        <div className="user-dialog-heading">
          <div className="user-dialog-activate-icon">
            {temporaryPassword ? (
              <CheckCircle2 size={23} />
            ) : (
              <KeyRound size={23} />
            )}
          </div>

          <button
            type="button"
            className="edit-user-close"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Fechar"
          >
            <X size={19} />
          </button>
        </div>

        {temporaryPassword === null ? (
          <>
            <h2 id="reset-password-title">
              Repor palavra-passe?
            </h2>

            <p id="reset-password-description">
              Pretendes gerar uma nova palavra-passe
              temporária para{" "}
              <strong>{user.name}</strong>?
            </p>

            <p className="user-dialog-note">
              A palavra-passe anterior deixará de ser
              válida. O utilizador terá de alterar a
              nova credencial no próximo acesso.
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
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="user-activate-confirm"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "A repor..."
                  : "Confirmar reposição"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="reset-password-title">
              Palavra-passe reposta
            </h2>

            <p id="reset-password-description">
              A credencial temporária de{" "}
              <strong>{user.name}</strong> foi gerada.
            </p>

            <div className="reset-password-result">
              <label htmlFor="generated-password">
                Palavra-passe temporária
              </label>

              <div className="reset-password-value">
                <input
                  id="generated-password"
                  type="text"
                  value={temporaryPassword}
                  readOnly
                  autoComplete="off"
                  spellCheck={false}
                />

                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  aria-label="Copiar palavra-passe temporária"
                >
                  <Copy size={18} />
                </button>
              </div>

              {copied && (
                <p role="status">
                  Credencial copiada.
                </p>
              )}
            </div>

            {error && (
              <p className="change-password-error" role="alert">
                {error}
              </p>
            )}

            <p className="reset-password-warning">
              Esta credencial só será apresentada nesta
              confirmação. Entrega-a por um canal seguro.
              Ao fechar, não poderás voltar a consultá-la.
            </p>

            <div className="user-dialog-actions">
              <button
                type="button"
                className="user-activate-confirm"
                onClick={handleClose}
              >
                Concluir
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
