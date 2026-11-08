
import { useState } from "react";
import { AlertTriangle, UserX, X } from "lucide-react";

import { nucleusService } from "../../services/nucleusService";
import type { Nucleus } from "../../types/nucleus/Nucleus";

interface DeactivateNucleusModalProps {
  nucleus: Nucleus;
  onClose: () => void;
  onDeactivated: () => void;
}

export default function DeactivateNucleusModal({
  nucleus,
  onClose,
  onDeactivated,
}: DeactivateNucleusModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleDeactivate() {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      await nucleusService.deactivateNucleus(nucleus.id);
      onDeactivated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao desactivar o Núcleo."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="nucleus-modal-backdrop"
      onMouseDown={event => {
        if (
          event.target === event.currentTarget &&
          !isSubmitting
        ) {
          onClose();
        }
      }}
    >
      <section
        className="nucleus-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="deactivate-nucleus-title"
        aria-describedby="deactivate-nucleus-description"
      >
        <div className="nucleus-modal-header">
          <div>
            <h2 id="deactivate-nucleus-title">
              Desactivar Núcleo
            </h2>
          </div>

          <button
            type="button"
            className="nucleus-modal-close"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="nucleus-deactivate-warning">
          <AlertTriangle size={24} />

          <p id="deactivate-nucleus-description">
            Tens a certeza de que pretendes desactivar
            o Núcleo <strong>{nucleus.name}</strong>?
          </p>
        </div>

        <p className="nucleus-deactivate-note">
          O Núcleo deixará de estar activo no sistema.
          Esta operação não elimina o seu registo.
        </p>

        {error && (
          <p
            className="change-password-error"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="nucleus-modal-actions">
          <button
            type="button"
            className="nucleus-cancel-button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="nucleus-deactivate-confirm"
            onClick={() => void handleDeactivate()}
            disabled={isSubmitting}
          >
            <UserX size={17} />

            {isSubmitting
              ? "A desactivar..."
              : "Confirmar desactivação"}
          </button>
        </div>
      </section>
    </div>
  );
}
