
import { useEffect, useState } from "react";

import {
  ArrowLeftRight,
  X,
  AlertCircle,
} from "lucide-react";

import { transferService } from "../../services/transferService";

interface DestinationNucleus {
  id: string;
  name: string;
}

interface Props {
  memberId: string;
  memberName: string;
  originNucleusId: string;
  originNucleusName: string;
  destinationNuclei: DestinationNucleus[];
  onClose: () => void;
  onCreated: () => void;
}

export default function RequestTransferModal({
  memberId,
  memberName,
  originNucleusId,
  originNucleusName,
  destinationNuclei,
  onClose,
  onCreated,
}: Props) {
  const [destinationNucleusId, setDestinationNucleusId] =
    useState("");

  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const availableNuclei = destinationNuclei.filter(
    (nucleus) => nucleus.id !== originNucleusId
  );

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [isSubmitting, onClose]);

  async function handleSubmit(
    event: React.SubmitEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");

    const normalizedReason = reason.trim();

    if (!destinationNucleusId) {
      setError("Selecciona o Núcleo de destino.");
      return;
    }

    if (destinationNucleusId === originNucleusId) {
      setError(
        "O Núcleo de destino deve ser diferente do Núcleo de origem."
      );
      return;
    }

    if (
      !availableNuclei.some(
        (nucleus) => nucleus.id === destinationNucleusId
      )
    ) {
      setError(
        "O Núcleo de destino seleccionado não é válido."
      );
      return;
    }

    if (!normalizedReason) {
      setError("Indica o motivo da transferência.");
      return;
    }

    setIsSubmitting(true);

    try {
      await transferService.requestTransfer({
        memberId,
        destinationNucleusId,
        reason: normalizedReason,
      });

      onCreated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível solicitar a transferência."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="transfer-modal-backdrop"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isSubmitting
        ) {
          onClose();
        }
      }}
    >
      <section
        className="transfer-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-modal-title"
      >
        <div className="transfer-modal-header">
          <div className="transfer-modal-heading">
            <ArrowLeftRight size={23} />

            <div>
              <h2 id="transfer-modal-title">
                Solicitar Transferência
              </h2>

              <p>
                Transferência de militante entre Núcleos.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="transfer-modal-close"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="transfer-member-summary">
          <div>
            <span>Militante</span>
            <strong>{memberName}</strong>
          </div>

          <div>
            <span>Núcleo de origem</span>
            <strong>{originNucleusName}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="transfer-field">
            <label htmlFor="transfer-destination">
              Núcleo de destino *
            </label>

            <select
              id="transfer-destination"
              value={destinationNucleusId}
              onChange={(event) =>
                setDestinationNucleusId(event.target.value)
              }
              disabled={isSubmitting}
              required
            >
              <option value="">
                Seleccionar Núcleo de destino
              </option>

              {availableNuclei.map((nucleus) => (
                <option
                  key={nucleus.id}
                  value={nucleus.id}
                >
                  {nucleus.name}
                </option>
              ))}
            </select>
          </div>

          <div className="transfer-field">
            <label htmlFor="transfer-reason">
              Motivo da transferência *
            </label>

            <textarea
              id="transfer-reason"
              value={reason}
              onChange={(event) =>
                setReason(event.target.value)
              }
              placeholder="Ex.: Mudança de residência"
              rows={4}
              maxLength={500}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="transfer-info">
            <AlertCircle size={18} />

            <p>
              A transferência ficará pendente até
              à decisão do órgão competente.
              O enquadramento actual do militante
              não será alterado por este pedido.
            </p>
          </div>

          {availableNuclei.length === 0 && (
            <p className="transfer-error" role="alert">
              Não existem Núcleos de destino
              disponíveis para selecção.
            </p>
          )}

          {error && (
            <p className="transfer-error" role="alert">
              {error}
            </p>
          )}

          <div className="transfer-modal-actions">
            <button
              type="button"
              className="transfer-cancel-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="transfer-submit-button"
              disabled={
                isSubmitting ||
                availableNuclei.length === 0
              }
            >
              <ArrowLeftRight size={17} />

              {isSubmitting
                ? "A solicitar..."
                : "Solicitar transferência"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
