import { useEffect, useState } from "react";
import { Eye, RefreshCw, Search, ShieldCheck } from "lucide-react";

import { auditService } from "../services/auditService";

import AuditEventDetailsModal from "../components/audit/AuditEventDetailsModal";
import AuditAccessManagement from "../components/audit/AuditAccessManagement";

import type {
  AuditAction,
  AuditEvent,
  AuditOutcome,
  AuditSearchParams,
} from "../types/audit/AuditEvent";

import { AUDIT_ACTIONS } from "../types/audit/AuditEvent";

import {
  AUDIT_ACTION_LABELS,
  AUDIT_OUTCOME_LABELS,
  formatAuditDate,
} from "../utils/auditLabels";

function toInstant(value: string): string | undefined {
  if (!value) return undefined;
  return new Date(value).toISOString();
}

interface AuditPageProps {
  permissions: string[];
}

export default function AuditPage({ permissions }: AuditPageProps) {
  const [events, setEvents] = useState<AuditEvent[]>([]);

  const [action, setAction] = useState<AuditAction | "">("");
  const [outcome, setOutcome] = useState<AuditOutcome | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [filters, setFilters] = useState<AuditSearchParams>({
    page: 0,
    size: 10,
  });

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      setIsLoading(true);
      setError("");

      try {
        const result = await auditService.listAuditEvents(
          {
            ...filters,
            page,
          },
          controller.signal,
        );

        if (controller.signal.aborted) return;

        setEvents(result.content);
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);
      } catch (err) {
        if (controller.signal.aborted) return;

        setEvents([]);
        setTotalPages(0);
        setTotalElements(0);

        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar eventos de auditoria.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadEvents();

    return () => controller.abort();
  }, [filters, page, refreshKey]);

  function handleSearch() {
    if (from && to && from > to) {
      setError("A data inicial não pode ser posterior à data final.");
      return;
    }

    setPage(0);

    setFilters({
      action,
      outcome,
      from: toInstant(from),
      to: toInstant(to),
      size: 10,
    });
  }

  function handleClear() {
    setAction("");
    setOutcome("");
    setFrom("");
    setTo("");
    setPage(0);
    setFilters({ page: 0, size: 10 });
  }

  return (
    <div className="audit-page">
      <div className="dashboard-heading">
        <h1>Auditoria do Sistema</h1>
        <p>Consulta e acompanhamento das actividades registadas no SGN.</p>
      </div>

      <section className="audit-card">
        <div className="audit-card-header">
          <div className="audit-card-title">
            <ShieldCheck size={23} />

            <div>
              <h3>Eventos de auditoria</h3>
              <p>{totalElements} registo(s) encontrado(s)</p>
            </div>
          </div>

          <button
            type="button"
            className="users-refresh-button"
            onClick={() => setRefreshKey((value) => value + 1)}
            disabled={isLoading}
          >
            <RefreshCw size={17} />
            Actualizar
          </button>
        </div>

        <div className="audit-filters">
          <div className="audit-filter-field">
            <label htmlFor="audit-action">Acção</label>

            <select
              id="audit-action"
              value={action}
              onChange={(event) =>
                setAction(event.target.value as AuditAction | "")
              }
            >
              <option value="">Todas as acções</option>

              {AUDIT_ACTIONS.map((value) => (
                <option key={value} value={value}>
                  {AUDIT_ACTION_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <div className="audit-filter-field">
            <label htmlFor="audit-outcome">Resultado</label>

            <select
              id="audit-outcome"
              value={outcome}
              onChange={(event) =>
                setOutcome(event.target.value as AuditOutcome | "")
              }
            >
              <option value="">Todos os resultados</option>
              <option value="SUCCESS">Sucesso</option>
              <option value="FAILURE">Falha</option>
            </select>
          </div>

          <div className="audit-filter-field">
            <label htmlFor="audit-from">Data inicial</label>

            <input
              id="audit-from"
              type="datetime-local"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>

          <div className="audit-filter-field">
            <label htmlFor="audit-to">Data final</label>

            <input
              id="audit-to"
              type="datetime-local"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
        </div>

        <div className="audit-filter-actions">
          <button
            type="button"
            className="members-search-button"
            onClick={handleSearch}
          >
            <Search size={17} />
            Pesquisar
          </button>

          <button
            type="button"
            className="members-clear-button"
            onClick={handleClear}
          >
            Limpar
          </button>
        </div>

        {error && (
          <div className="change-password-error" role="alert">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="users-table-message">
            A carregar eventos de auditoria...
          </div>
        ) : events.length === 0 ? (
          <div className="users-table-empty">
            <ShieldCheck size={30} />
            <strong>Nenhum evento encontrado</strong>
            <p>Não existem registos para os filtros seleccionados.</p>
          </div>
        ) : (
          <div className="audit-table-scroll">
            <table className="audit-table">
              <thead>
                <tr>
                  <th scope="col">Data e hora</th>
                  <th scope="col">Acção</th>
                  <th scope="col">Recurso</th>
                  <th scope="col">Resultado</th>
                  <th scope="col">Acções</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>{formatAuditDate(event.occurredAt)}</td>

                    <td>{AUDIT_ACTION_LABELS[event.action] ?? event.action}</td>

                    <td>{event.resourceType || "—"}</td>

                    <td>
                      <span
                        className={`audit-outcome audit-outcome-${event.outcome.toLowerCase()}`}
                      >
                        {AUDIT_OUTCOME_LABELS[event.outcome]}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="audit-details-button"
                        onClick={() => setSelectedEventId(event.id)}
                      >
                        <Eye size={16} />
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="audit-pagination">
          <span>
            A mostrar{" "}
            {events.length === 0
              ? 0
              : page * (filters.size ?? 10) + events.length}{" "}
            de {totalElements} registos
          </span>

          <div>
            <button
              type="button"
              disabled={isLoading || page === 0}
              onClick={() => setPage((value) => value - 1)}
            >
              Anterior
            </button>

            <button
              type="button"
              disabled={isLoading || totalPages === 0 || page + 1 >= totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              Próxima
            </button>
          </div>
        </div>
      </section>

      {/* GESTÃO DE ACESSOS À AUDITORIA */}
      {permissions.includes("AUDIT_MANAGE") && (
        <AuditAccessManagement permissions={permissions} />
      )}

      {/* DETALHES DO EVENTO */}
      {selectedEventId && (
        <AuditEventDetailsModal
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}
    </div>
  );
}
