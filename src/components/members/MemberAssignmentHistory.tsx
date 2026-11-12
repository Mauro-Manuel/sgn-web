
import { useEffect, useState } from "react";
import { Network, RefreshCw } from "lucide-react";

import { memberService } from "../../services/memberService";

import type {
  MemberAssignmentHistory as AssignmentHistory,
} from "../../types/member/MemberAssignmentHistory";

interface Props {
  memberId: string;
}

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

export default function MemberAssignmentHistory({
  memberId,
}: Props) {
  const [assignments, setAssignments] = useState<
    AssignmentHistory[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadHistory() {
      setIsLoading(true);
      setError("");

      try {
        const result =
          await memberService.getMemberAssignmentHistory(
            memberId,
            controller.signal
          );

        if (controller.signal.aborted) return;

        setAssignments(result);
      } catch (err) {
        if (controller.signal.aborted) return;

        setAssignments([]);

        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar o histórico de enquadramentos."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadHistory();

    return () => controller.abort();
  }, [memberId, refreshKey]);

  return (
    <section
      className="member-assignment-history"
      aria-label="Histórico de enquadramentos"
    >
      <div className="member-assignment-history-header">
        <div className="member-assignment-history-title">
          <Network size={20} />

          <div>
            <h3>Histórico de Enquadramentos</h3>
            <p>
              Núcleos aos quais o militante esteve
              associado.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="member-assignment-history-refresh"
          onClick={() =>
            setRefreshKey(current => current + 1)
          }
          disabled={isLoading}
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      {error && (
        <p
          className="change-password-error"
          role="alert"
        >
          {error}
        </p>
      )}

      {isLoading ? (
        <p
          className="member-assignment-history-message"
          role="status"
        >
          A carregar histórico de enquadramentos...
        </p>
      ) : !error && assignments.length === 0 ? (
        <div className="member-assignment-history-empty">
          <Network size={26} />

          <p>
            Nenhum histórico de enquadramento encontrado.
          </p>
        </div>
      ) : !error ? (
        <div className="member-assignment-history-table-scroll">
          <table className="member-assignment-history-table">
            <thead>
              <tr>
                <th scope="col">Núcleo</th>
                <th scope="col">Início</th>
                <th scope="col">Fim</th>
                <th scope="col">Situação</th>
              </tr>
            </thead>

            <tbody>
              {assignments.map(assignment => (
                <tr key={assignment.id}>
                  <td>
                    {assignment.nucleusName ||
                      "Núcleo indisponível"}
                  </td>

                  <td>
                    {formatDate(assignment.startDate)}
                  </td>

                  <td>
                    {assignment.endDate
                      ? formatDate(assignment.endDate)
                      : "—"}
                  </td>

                  <td>
                    <span
                      className={
                        assignment.current
                          ? "member-assignment-status member-assignment-current"
                          : "member-assignment-status member-assignment-previous"
                      }
                    >
                      {assignment.current
                        ? "Actual"
                        : "Anterior"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
