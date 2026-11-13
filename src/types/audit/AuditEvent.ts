export const AUDIT_ACTIONS = [
  "LOGIN_SUCCESS",
  "LOGIN_FAILURE",
  "LOGOUT",

  "USER_CREATED",
  "USER_UPDATED",
  "USER_ACTIVATED",
  "USER_DEACTIVATED",
  "PASSWORD_CHANGED",
  "PASSWORD_RESET",

  "MEMBER_REGISTERED",
  "MEMBER_UPDATED",
  "MEMBER_ID_CORRECTED",

  "ADMISSION_DECIDED",

  // Transferências
  "TRANSFER_REQUESTED",
  "TRANSFER_COMPETENT_BODY_ASSIGNED",
  "TRANSFER_DECIDED",

  "NUCLEUS_CREATED",
  "NUCLEUS_UPDATED",
  "NUCLEUS_ACTIVATED",
  "NUCLEUS_DEACTIVATED",

  "ACCESS_DENIED",
  "SUPERVISOR_ASSIGNED",
  "BODY_AUTHORIZATION_GRANTED",

  "AUDIT_ACCESS_GRANTED",
  "AUDIT_ACCESS_REVOKED",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export type AuditOutcome = "SUCCESS" | "FAILURE";

export interface AuditEvent {
  id: string;
  actorId: string | null;
  action: AuditAction;
  resourceType: string | null;
  resourceId: string | null;
  outcome: AuditOutcome;
  occurredAt: string;
}

export interface AuditEventPage {
  content: AuditEvent[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AuditSearchParams {
  actorId?: string;
  action?: AuditAction | "";
  outcome?: AuditOutcome | "";
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}
