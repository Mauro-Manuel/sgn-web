
import type {
  AuditEvent,
  AuditEventPage,
  AuditSearchParams,
} from "../types/audit/AuditEvent";

const API_BASE_URL = "/api/v1/audit-events";

async function handleResponse<T>(
  response: Response
): Promise<T> {
  if (response.status === 401) {
    throw new Error(
      "A sessão expirou. Autentica-te novamente."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "Não tens permissão para consultar a auditoria."
    );
  }

  if (response.status === 404) {
    throw new Error(
      "Registo de auditoria não encontrado."
    );
  }

  if (!response.ok) {
    throw new Error(
      "Não foi possível consultar os registos de auditoria."
    );
  }

  return response.json() as Promise<T>;
}

async function listAuditEvents(
  filters: AuditSearchParams = {},
  signal?: AbortSignal
): Promise<AuditEventPage> {
  const params = new URLSearchParams({
    page: String(filters.page ?? 0),
    size: String(filters.size ?? 20),
    sort: "occurredAt,desc",
  });

  if (filters.actorId) {
    params.set("actorId", filters.actorId);
  }

  if (filters.action) {
    params.set("action", filters.action);
  }

  if (filters.outcome) {
    params.set("outcome", filters.outcome);
  }

  if (filters.from) {
    params.set("from", filters.from);
  }

  if (filters.to) {
    params.set("to", filters.to);
  }

  const response = await fetch(
    `${API_BASE_URL}?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal,
    }
  );

  return handleResponse<AuditEventPage>(response);
}

async function getAuditEventById(
  id: string,
  signal?: AbortSignal
): Promise<AuditEvent> {
  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(id)}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      signal,
    }
  );

  return handleResponse<AuditEvent>(response);
}

export const auditService = {
  listAuditEvents,
  getAuditEventById,
};
