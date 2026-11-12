
import { useEffect, useState } from "react";
import { ShieldCheck, X } from "lucide-react";

import { auditService } from "../../services/auditService";

import type { AuditEvent } from "../../types/audit/AuditEvent";

import {
  AUDIT_ACTION_LABELS,
  AUDIT_OUTCOME_LABELS,
  formatAuditDate,
} from "../../utils/auditLabels";

interface Props {
  eventId: string;
  onClose: () => void;
}

export default function AuditEventDetailsModal({
  eventId,
  onClose,
}: Props) {
  const [event, setEvent] = useState<AuditEvent | null>(
    null
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvent() {
      setIsLoading(true);
      setError("");
      setEvent(null);

      try {
        const result = await auditService.getAuditEventById(
          eventId,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setEvent(result);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Erro ao consultar evento."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadEvent();

    return () => controller.abort();
  }, [eventId]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
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
  }, [onClose]);

  return (
    <div
      className="audit-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="audit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-modal-title"
      >
        <div className="audit-modal-header">
          <div className="audit-modal-heading">
            <ShieldCheck size={22} />

            <div>
              <h2 id="audit-modal-title">
                Detalhes do Evento
              </h2>
              <p>Informações do registo de auditoria.</p>
            </div>
          </div>

          <button
            type="button"
            className="audit-modal-close"
            onClick={onClose}
            aria-label="Fechar detalhes"
          >
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <p>A carregar detalhes...</p>
        ) : error ? (
          <p className="change-password-error" role="alert">
            {error}
          </p>
        ) : event ? (
          <div className="audit-details-grid">
            <div>
              <label>Acção</label>
              <strong>
                {AUDIT_ACTION_LABELS[event.action] ??
                  event.action}
              </strong>
            </div>

            <div>
              <label>Resultado</label>
              <span
                className={`audit-outcome audit-outcome-${event.outcome.toLowerCase()}`}
              >
                {AUDIT_OUTCOME_LABELS[event.outcome]}
              </span>
            </div>

            <div>
              <label>Data e hora</label>
              <strong>
                {formatAuditDate(event.occurredAt)}
              </strong>
            </div>

            <div>
              <label>Tipo de recurso</label>
              <strong>
                {event.resourceType || "Não aplicável"}
              </strong>
            </div>
          </div>
        ) : null}

        <div className="audit-modal-actions">
          <button
            type="button"
            className="nucleus-cancel-button"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </section>
    </div>
  );
}
