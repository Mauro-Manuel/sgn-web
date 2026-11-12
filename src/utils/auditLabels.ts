
import type {
  AuditAction,
  AuditOutcome,
} from "../types/audit/AuditEvent";

export const AUDIT_ACTION_LABELS: Record<
  AuditAction,
  string
> = {
  LOGIN_SUCCESS: "Início de sessão",
  LOGIN_FAILURE: "Falha na autenticação",
  LOGOUT: "Fim de sessão",

  USER_CREATED: "Utilizador criado",
  USER_UPDATED: "Utilizador actualizado",
  USER_ACTIVATED: "Utilizador activado",
  USER_DEACTIVATED: "Utilizador desactivado",
  PASSWORD_CHANGED: "Palavra-passe alterada",
  PASSWORD_RESET: "Palavra-passe reposta",

  MEMBER_REGISTERED: "Militante registado",
  MEMBER_UPDATED: "Militante actualizado",
  MEMBER_ID_CORRECTED: "BI do militante corrigido",

  ADMISSION_DECIDED: "Decisão de admissão",

  TRANSFER_REQUESTED: "Transferência solicitada",
  TRANSFER_DECIDED: "Decisão de transferência",

  NUCLEUS_CREATED: "Núcleo criado",
  NUCLEUS_UPDATED: "Núcleo actualizado",
  NUCLEUS_ACTIVATED: "Núcleo activado",
  NUCLEUS_DEACTIVATED: "Núcleo desactivado",

  ACCESS_DENIED: "Acesso recusado",
  SUPERVISOR_ASSIGNED: "Supervisor atribuído",
  BODY_AUTHORIZATION_GRANTED:
    "Autorização de órgão concedida",

  AUDIT_ACCESS_GRANTED: "Acesso à auditoria concedido",
  AUDIT_ACCESS_REVOKED: "Acesso à auditoria revogado",
};

export const AUDIT_OUTCOME_LABELS: Record<
  AuditOutcome,
  string
> = {
  SUCCESS: "Sucesso",
  FAILURE: "Falha",
};

export function formatAuditDate(value: string): string {
  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: "Africa/Luanda",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(value));
}
