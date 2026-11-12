import { useEffect, useState } from "react";
import { ShieldCheck, ShieldX, RefreshCw } from "lucide-react";

import { userService } from "../../services/userService";
import { auditAccessService } from "../../services/auditAccessService";

import type { UserResponse } from "../../types/user/UserResponse";
import AuditRevokeConfirmationModal from "./AuditRevokeConfirmationModal";

interface Props {
  permissions: string[];
}

export default function AuditAccessManagement({ permissions }: Props) {
  const [administrators, setAdministrators] = useState<UserResponse[]>([]);

  const [selectedUserId, setSelectedUserId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  const canManage = permissions.includes("AUDIT_MANAGE");

  const [revokeTarget, setRevokeTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [grantTarget, setGrantTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (!canManage) {
      return;
    }

    let cancelled = false;

    async function loadAdministrators() {
      setIsLoading(true);
      setError("");

      try {
        const results: UserResponse[] = [];
        let page = 0;
        let totalPages = 1;

        while (page < totalPages) {
          const response = await userService.listUsers(page, 50);

          if (cancelled) {
            return;
          }

          results.push(
            ...response.content.filter(
              (user) => user.role === "ADMIN" && user.active,
            ),
          );

          totalPages = response.totalPages;
          page += 1;
        }

        if (!cancelled) {
          setAdministrators(results);
        }
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os administradores.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadAdministrators();

    return () => {
      cancelled = true;
    };
  }, [canManage, refreshKey]);

  if (!canManage) {
    return null;
  }

  const selectedAdministrator = administrators.find(
    (user) => user.id === selectedUserId,
  );

  async function handleAccessChange(
    operation: "grant" | "revoke",
    userId: string,
    administratorName: string,
  ) {
    if (isSubmitting) {
      return;
    }

    const isGrant = operation === "grant";

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (isGrant) {
        await auditAccessService.grantAuditAccess(userId);
      } else {
        await auditAccessService.revokeAuditAccess(userId);
      }

      setSuccess(
        isGrant
          ? `Acesso à auditoria concedido a ${administratorName} com sucesso.`
          : `Acesso à auditoria revogado de ${administratorName} com sucesso.`,
      );

      setGrantTarget(null);
      setRevokeTarget(null);
      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível actualizar o acesso à auditoria.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleConfirmRevoke() {
    const target = revokeTarget;

    if (target === null || isSubmitting) {
      return;
    }

    void handleAccessChange("revoke", target.id, target.name);
  }

  function handleConfirmGrant() {
    const target = grantTarget;

    if (target === null || isSubmitting) {
      return;
    }

    void handleAccessChange("grant", target.id, target.name);
  }

  return (
    <section className="audit-access-card">
      <div className="audit-access-header">
        <div className="audit-access-heading">
          <ShieldCheck size={23} />

          <div>
            <h3>Gestão de Acessos à Auditoria</h3>
            <p>Conceder ou revogar acesso aos administradores do sistema.</p>
          </div>
        </div>

        <button
          type="button"
          className="audit-access-refresh"
          onClick={() => setRefreshKey((value) => value + 1)}
          disabled={isLoading || isSubmitting}
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      {success && (
        <div className="audit-access-success" role="status">
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Fechar notificação"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="audit-access-error" role="alert">
          {error}
        </div>
      )}

      <div className="audit-access-field">
        <label htmlFor="audit-administrator">Administrador</label>

        <select
          id="audit-administrator"
          value={selectedUserId}
          onChange={(event) => {
            setSelectedUserId(event.target.value);
            setSuccess("");
            setError("");
          }}
          disabled={isLoading || isSubmitting}
        >
          <option value="">
            {isLoading
              ? "A carregar administradores..."
              : "Seleccionar administrador"}
          </option>

          {administrators.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.username})
            </option>
          ))}
        </select>
      </div>

      <div className="audit-access-actions">
        <button
          type="button"
          className="audit-access-grant"
          onClick={() => {
            if (!selectedAdministrator) return;

            setGrantTarget({
              id: selectedAdministrator.id,
              name: selectedAdministrator.name,
            });
          }}
          disabled={!selectedUserId || isLoading || isSubmitting}
        >
          <ShieldCheck size={18} />
          Conceder acesso
        </button>

        <button
          type="button"
          className="audit-access-revoke"
          onClick={() => {
            if (!selectedAdministrator) return;

            setRevokeTarget({
              id: selectedAdministrator.id,
              name: selectedAdministrator.name,
            });
          }}
          disabled={!selectedUserId || isLoading || isSubmitting}
        >
          <ShieldX size={18} />
          Revogar acesso
        </button>
      </div>

      <p className="audit-access-note">
        Estas operações requerem a permissão AUDIT_MANAGE e são validadas pelo
        servidor.
      </p>


{/* MODAL DE CONCESSÃO */}
{grantTarget !== null && (
  <AuditRevokeConfirmationModal
    operation="grant"
    administratorName={grantTarget.name}
    isSubmitting={isSubmitting}
    onCancel={() => {
      if (!isSubmitting) {
        setGrantTarget(null);
      }
    }}
    onConfirm={handleConfirmGrant}
  />
)}


{/* MODAL DE REVOGAÇÃO */}
{revokeTarget !== null && (
  <AuditRevokeConfirmationModal
    operation="revoke"
    administratorName={revokeTarget.name}
    isSubmitting={isSubmitting}
    onCancel={() => {
      if (!isSubmitting) {
        setRevokeTarget(null);
      }
    }}
    onConfirm={handleConfirmRevoke}
  />
)}

    </section>
  );
}
