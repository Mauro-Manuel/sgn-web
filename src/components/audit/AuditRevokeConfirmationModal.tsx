import { useEffect } from "react";
import { ShieldAlert, X } from "lucide-react";

interface AuditRevokeConfirmationModalProps {
  operation: "grant" | "revoke";
  administratorName: string;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AuditRevokeConfirmationModal({
  operation,
  administratorName,
  isSubmitting,
  onConfirm,
  onCancel,
}: AuditRevokeConfirmationModalProps) {
  const isGrant = operation === "grant";

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSubmitting, onCancel]);

  return (
    <div
      className="audit-revoke-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onCancel();
        }
      }}
    >
      <section
        className="audit-revoke-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="audit-revoke-title"
        aria-describedby="audit-revoke-description"
      >
        <div className="audit-revoke-header">
          <div className="audit-revoke-icon">
            <ShieldAlert size={26} />
          </div>

          <button
            type="button"
            className="audit-revoke-close"
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <h2 id="audit-revoke-title">
          {isGrant
            ? "Conceder acesso à auditoria?"
            : "Revogar acesso à auditoria?"}
        </h2>

        <p id="audit-revoke-description">
          Tens a certeza de que pretendes {isGrant ? "conceder" : "revogar"} o
          acesso à auditoria do administrador{" "}
          <strong>{administratorName}</strong>?
        </p>

        <p className="audit-revoke-warning">
          {isGrant
            ? "Esta operação permitirá ao administrador aceder às funcionalidades de auditoria autorizadas pelo sistema."
            : "Esta operação poderá impedir o administrador de consultar os registos de auditoria do SGN."}
        </p>

        <div className="audit-revoke-actions">
          <button
            type="button"
            className="audit-revoke-cancel"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Não, cancelar
          </button>

          <button
            type="button"
            className={isGrant ? "audit-access-grant" : "audit-revoke-confirm"}
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "A processar..."
              : isGrant
                ? "Sim, conceder acesso"
                : "Sim, revogar acesso"}
          </button>
        </div>
      </section>
    </div>
  );
}
