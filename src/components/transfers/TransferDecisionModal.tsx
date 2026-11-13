
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeftRight,
  CheckCircle2,
  X,
  XCircle,
} from "lucide-react";

import { transferService } from "../../services/transferService";

import type { TransferDetail } from "../../types/transfer/TransferDetail";
import type { TransferDecision } from "../../types/transfer/TransferDecisionRequest";

interface Props {
  transfer: TransferDetail;
  onClose: () => void;
  onDecided: (decision: TransferDecision) => void;
}

export default function TransferDecisionModal({
  transfer,
  onClose,
  onDecided,
}: Props) {
  const [decision, setDecision] =
    useState<TransferDecision | null>(null);

  const [decisionReference, setDecisionReference] =
    useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSubmitting, onClose]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");

    if (transfer.status !== "PENDENTE") {
      setError(
        "Esta transferência já não está pendente."
      );
      return;
    }

    if (!decision) {
      setError(
        "Selecciona Aprovar ou Rejeitar."
      );
      return;
    }

    const reference = decisionReference.trim();

    if (!reference) {
      setError(
        "Indica a referência da decisão."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await transferService.decideTransfer(
        transfer.id,
        {
          decision,
          decisionReference: reference,
        }
      );

      onDecided(decision);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível registar a decisão."
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
        aria-labelledby="transfer-decision-title"
      >
        <div className="transfer-modal-header">
          <div className="transfer-modal-heading">
            <ArrowLeftRight size={23} />

            <div>
              <h2 id="transfer-decision-title">
                Decisão de Transferência
              </h2>

              <p>
                Aprovação ou rejeição pelo órgão competente.
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

        <div className="transfer-decision-summary">
          <div>
            <span>Militante</span>
            <strong>{transfer.memberName}</strong>
          </div>

          <div>
            <span>Núcleo de origem</span>
            <strong>{transfer.sourceNucleusName}</strong>
          </div>

          <div>
            <span>Núcleo de destino</span>
            <strong>{transfer.destinationNucleusName}</strong>
          </div>

          <div>
            <span>Motivo da transferência</span>
            <p>{transfer.reason}</p>
          </div>
        </div>

        {transfer.status !== "PENDENTE" ? (
          <p className="transfer-error" role="alert">
            Este pedido já não está pendente de decisão.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="transfer-field">
              <label>Decisão *</label>

              <div className="transfer-decision-options">
                <button
                  type="button"
                  className={`transfer-decision-option transfer-decision-approve ${
                    decision === "APROVADA" ? "selected" : ""
                  }`}
                  onClick={() => setDecision("APROVADA")}
                  disabled={isSubmitting}
                  aria-pressed={decision === "APROVADA"}
                >
                  <CheckCircle2 size={18} />
                  Aprovar
                </button>

                <button
                  type="button"
                  className={`transfer-decision-option transfer-decision-reject ${
                    decision === "REJEITADA" ? "selected" : ""
                  }`}
                  onClick={() => setDecision("REJEITADA")}
                  disabled={isSubmitting}
                  aria-pressed={decision === "REJEITADA"}
                >
                  <XCircle size={18} />
                  Rejeitar
                </button>
              </div>
            </div>

            <div className="transfer-field">
              <label htmlFor="transfer-decision-reference">
                N.º da Acta / Referência da Decisão *
              </label>

              <input
                id="transfer-decision-reference"
                type="text"
                value={decisionReference}
                onChange={(event) =>
                  setDecisionReference(event.target.value)
                }
                placeholder="Ex.: DEC-TRF-2026-001"
                disabled={isSubmitting}
                required
              />
            </div>

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
                  !decision ||
                  !decisionReference.trim()
                }
              >
                {isSubmitting
                  ? "A registar decisão..."
                  : "Confirmar decisão"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
