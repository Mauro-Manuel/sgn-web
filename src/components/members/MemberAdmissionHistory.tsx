
import { useEffect, useState } from "react";
import { ClipboardList, RefreshCw } from "lucide-react";

import { memberService } from "../../services/memberService";

import type { MemberAdmissionHistory as AdmissionHistory } from "../../types/member/MemberAdmissionHistory";

interface Props {
  memberId: string;
}

const admissionLabels: Record<string, string> = {
  PENDENTE: "Pendente",
  ADMITIDO: "Admitido",
  NAO_ADMITIDO: "Não admitido",
};

export default function MemberAdmissionHistory({
  memberId,
}: Props) {
  const [admissions, setAdmissions] = useState<AdmissionHistory[]>([]);
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
          await memberService.getMemberAdmissionHistory(
            memberId,
            controller.signal
          );

        if (controller.signal.aborted) return;

        setAdmissions(result);
      } catch (err) {
        if (controller.signal.aborted) return;

        setAdmissions([]);

        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar o histórico de admissões."
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
      className="member-admission-history"
      aria-label="Histórico de admissões"
    >
      <div className="member-admission-history-header">
        <div className="member-admission-history-title">
          <ClipboardList size={20} />

          <div>
            <h3>Histórico de Admissões</h3>
            <p>
              Registos de admissão associados ao militante.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="member-admission-history-refresh"
          onClick={() =>
            setRefreshKey(current => current + 1)
          }
          disabled={isLoading}
          aria-label="Actualizar histórico de admissões"
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      {error && (
        <p className="change-password-error" role="alert">
          {error}
        </p>
      )}

      {isLoading ? (
        <p
          className="member-admission-history-message"
          role="status"
        >
          A carregar histórico de admissões...
        </p>
      ) : !error && admissions.length === 0 ? (
        <div className="member-admission-history-empty">
          <ClipboardList size={26} />
          <p>Nenhum histórico de admissão encontrado.</p>
        </div>
      ) : !error ? (
        <div className="member-admission-history-table-scroll">
          <table className="member-admission-history-table">
            <thead>
              <tr>
                <th scope="col">Núcleo</th>
                <th scope="col">Admissão</th>
                <th scope="col">Referência da decisão</th>
              </tr>
            </thead>

            <tbody>
              {admissions.map(admission => (
                <tr key={admission.id}>
                  <td>
                    {admission.nucleusName ||
                      "Núcleo indisponível"}
                  </td>

                  <td>
                    <span
                      className={`member-admission-badge member-admission-${admission.status.toLowerCase()}`}
                    >
                      {admissionLabels[admission.status] ??
                        admission.status}
                    </span>
                  </td>

                  <td>
                    {admission.decisionReference ||
                      "Sem referência"}
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
