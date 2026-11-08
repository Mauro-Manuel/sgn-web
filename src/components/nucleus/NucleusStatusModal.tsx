
import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Power,
  X,
} from "lucide-react";

import { nucleusService } from "../../services/nucleusService";
import type { Nucleus } from "../../types/nucleus/Nucleus";

interface NucleusStatusModalProps {
  nucleus: Nucleus;
  onClose: () => void;
  onStatusChanged: () => void;
}

export default function NucleusStatusModal({
  nucleus,
  onClose,
  onStatusChanged,
}: NucleusStatusModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isDeactivating = nucleus.active;

  async function handleConfirm() {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      if (isDeactivating) {
        await nucleusService.deactivateNucleus(nucleus.id);
      } else {
        await nucleusService.activateNucleus(nucleus.id);
      }

      onStatusChanged();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao actualizar o estado do Núcleo."
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
        aria-labelledby="nucleus-status-title"
        aria-describedby="nucleus-status-description"
      >
        <div className="nucleus-modal-header">
          <div>
            <h2 id="nucleus-status-title">
              {isDeactivating
                ? "Desactivar Núcleo"
                : "Activar Núcleo"}
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

        <div
          className={
            isDeactivating
              ? "nucleus-deactivate-warning"
              : "nucleus-activate-info"
          }
        >
          {isDeactivating ? (
            <AlertTriangle size={24} />
          ) : (
            <CheckCircle2 size={24} />
          )}

          <p id="nucleus-status-description">
            Tens a certeza de que pretendes{" "}
            {isDeactivating ? "desactivar" : "activar"} o
            Núcleo <strong>{nucleus.name}</strong>?
          </p>
        </div>

        <p className="nucleus-deactivate-note">
          {isDeactivating
            ? "O Núcleo deixará de estar activo no sistema. O registo não será eliminado."
            : "O Núcleo voltará a ficar activo no sistema."}
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
            className={
              isDeactivating
                ? "nucleus-deactivate-confirm"
                : "nucleus-activate-confirm"
            }
            onClick={() => void handleConfirm()}
            disabled={isSubmitting}
          >
            <Power size={17} />

            {isSubmitting
              ? isDeactivating
                ? "A desactivar..."
                : "A activar..."
              : isDeactivating
                ? "Confirmar desactivação"
                : "Confirmar activação"}
          </button>
        </div>
      </section>
    </div>
  );
}
