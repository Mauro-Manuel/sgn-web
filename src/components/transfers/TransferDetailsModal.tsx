
import { useEffect, useState } from "react";
import { ArrowLeftRight, X } from "lucide-react";

import { transferService } from "../../services/transferService";
import type { TransferDetail } from "../../types/transfer/TransferDetail";

interface Props {
  transferId: string;
  onClose: () => void;
}

function formatDate(value: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: "Africa/Luanda",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function statusLabel(status: string): string {
  if (status === "PENDENTE") return "Pendente";
  return status.replaceAll("_", " ");
}

export default function TransferDetailsModal({
  transferId,
  onClose,
}: Props) {
  const [transfer, setTransfer] =
    useState<TransferDetail | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadDetails() {
      setIsLoading(true);
      setError("");

      try {
        const result = await transferService.getTransferById(
          transferId,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setTransfer(result);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Erro ao consultar transferência."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadDetails();

    return () => controller.abort();
  }, [transferId]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () =>
      document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="transfer-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="transfer-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transfer-details-title"
      >
        <div className="transfer-modal-header">
          <div className="transfer-modal-heading">
            <ArrowLeftRight size={23} />

            <div>
              <h2 id="transfer-details-title">
                Detalhes da Transferência
              </h2>
              <p>
                Informações do pedido e da decisão.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="transfer-modal-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <p role="status">
            A carregar transferência...
          </p>
        ) : error ? (
          <p className="transfer-error" role="alert">
            {error}
          </p>
        ) : transfer ? (
          <div className="transfer-details-grid">
            <div>
              <span>Militante</span>
              <strong>{transfer.memberName}</strong>
            </div>

            <div>
              <span>Estado</span>
              <strong>{statusLabel(transfer.status)}</strong>
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
              <span>Data do pedido</span>
              <strong>{formatDate(transfer.requestedAt)}</strong>
            </div>

            <div>
              <span>Data da decisão</span>
              <strong>{formatDate(transfer.decidedAt)}</strong>
            </div>

            <div className="transfer-details-full">
              <span>Motivo da transferência</span>
              <p>{transfer.reason}</p>
            </div>

            <div className="transfer-details-full">
              <span>Referência da decisão</span>
              <strong>
                {transfer.decisionReference || "—"}
              </strong>
            </div>
          </div>
        ) : null}

        <div className="transfer-modal-actions">
          <button
            type="button"
            className="transfer-cancel-button"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </section>
    </div>
  );
}
