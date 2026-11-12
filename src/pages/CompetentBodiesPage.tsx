import { useEffect, useState } from "react";
import { RefreshCw, CheckCircle2, X } from "lucide-react";

import CreateCompetentBodyForm from "../components/competentBodies/CreateCompetentBodyForm";

import { competentBodyService } from "../services/competentBodyService";
import { organizationalUnitService } from "../services/organizationalUnitService";

import type { CompetentBody } from "../types/competentBody/CompetentBody";

interface OrganizationalUnitOption {
  id: string;
  name: string;
}

export default function CompetentBodiesPage() {
  const [bodies, setBodies] = useState<CompetentBody[]>([]);
  const [units, setUnits] = useState<OrganizationalUnitOption[]>([]);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUnits, setIsLoadingUnits] = useState(true);

  const [error, setError] = useState("");
  const [unitsError, setUnitsError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUnits() {
      setIsLoadingUnits(true);
      setUnitsError("");

      try {
        const allUnits: OrganizationalUnitOption[] = [];
        let currentPage = 0;
        let pages = 1;

        do {
          const result =
            await organizationalUnitService.listOrganizationalUnits(
              currentPage,
              50,
            );

          if (!active) return;

          allUnits.push(
            ...result.content.map((unit) => ({
              id: unit.id,
              name: unit.name,
            })),
          );

          pages = result.totalPages;
          currentPage++;
        } while (currentPage < pages);

        if (active) setUnits(allUnits);
      } catch (err) {
        if (active) {
          setUnitsError(
            err instanceof Error
              ? err.message
              : "Erro ao carregar Unidades Organizacionais.",
          );
        }
      } finally {
        if (active) setIsLoadingUnits(false);
      }
    }

    void loadUnits();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBodies() {
      setIsLoading(true);
      setError("");

      try {
        const result = await competentBodyService.listCompetentBodies(
          page,
          10,
          controller.signal,
        );

        if (controller.signal.aborted) return;

        setBodies(result.content);
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);
      } catch (err) {
        if (controller.signal.aborted) return;

        setBodies([]);
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar Órgãos Competentes.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadBodies();

    return () => controller.abort();
  }, [page, refreshKey]);

  function handleCreated() {
    setSuccess(true);

    if (page !== 0) {
      setPage(0);
    } else {
      setRefreshKey((value) => value + 1);
    }
  }

  function getUnitName(id: string): string {
    return units.find((unit) => unit.id === id)?.name ?? "—";
  }

  return (
    <div className="competent-bodies-page">
      <div className="dashboard-heading">
        <h1>Gestão de Órgãos Competentes</h1>
        <p>
          Registo e consulta dos órgãos responsáveis por decisões de admissão.
        </p>
      </div>

      {/* LISTAGEM DE ÓRGÃOS COMPETENTES */}
      <section className="competent-body-card">
        <div className="competent-body-list-header">
          <div>
            <h3>Órgãos Competentes registados</h3>
            <p>{totalElements} registo(s) encontrado(s)</p>
          </div>

          <button
            type="button"
            className="admission-refresh-button"
            onClick={() => setRefreshKey((value) => value + 1)}
            disabled={isLoading}
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
        </div>

        {error && <p role="alert">{error}</p>}

        {isLoading ? (
          <p>A carregar órgãos competentes...</p>
        ) : bodies.length === 0 ? (
          <p>Nenhum Órgão Competente encontrado.</p>
        ) : (
          <div className="competent-body-table-scroll">
            <table className="competent-body-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome</th>
                  <th>Unidade Organizacional</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {bodies.map((body) => (
                  <tr key={body.id}>
                    <td>{body.code}</td>
                    <td>{body.name}</td>
                    <td>
                      {body.organizationalUnitId
                        ? getUnitName(body.organizationalUnitId)
                        : "—"}
                    </td>
                    <td>
                      {body.active === undefined
                        ? "—"
                        : body.active
                          ? "Activo"
                          : "Inactivo"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="competent-body-pagination">
          <span>
            {totalPages === 0
              ? "Sem páginas"
              : `Página ${page + 1} de ${totalPages}`}
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

      {/* NOTIFICAÇÃO DE CRIAÇÃO */}

      {success && (
        <div className="competent-body-success" role="status">
          <CheckCircle2 size={21} />

          <strong>Órgão Competente criado com sucesso!</strong>

          <button
            type="button"
            className="competent-body-success-close"
            onClick={() => setSuccess(false)}
            aria-label="Fechar notificação"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* ERROS DAS UNIDADES ORGANIZACIONAIS */}
      {unitsError && (
        <p role="alert" className="change-password-error">
          {unitsError}
        </p>
      )}

      {/* FORMULÁRIO DE CRIAÇÃO */}
      {isLoadingUnits ? (
        <div className="competent-body-card">
          A carregar Unidades Organizacionais...
        </div>
      ) : (
        <CreateCompetentBodyForm
          organizationalUnits={units}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
