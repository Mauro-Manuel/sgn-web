import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Network, RefreshCw } from "lucide-react";

import { organizationalUnitService } from "../../services/organizationalUnitService";

import type { OrganizationalUnit } from "../../types/organizational/OrganizationalUnit";
import type { PageResponse } from "../../types/user/PageResponse";
import { territorialUnitService } from "../../services/territorialUnitService";

interface OrganizationalUnitsTableProps {
  refreshKey: number;
}

const PAGE_SIZE = 10;

export default function OrganizationalUnitsTable({
  refreshKey,
}: OrganizationalUnitsTableProps) {
  const [page, setPage] = useState(0);

  const [unitsPage, setUnitsPage] =
    useState<PageResponse<OrganizationalUnit> | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [parentNames, setParentNames] = useState<Record<string, string>>({});

  const parentCache = useRef(new Map<string, string>());

  const [territoryNames, setTerritoryNames] = useState<Record<string, string>>(
    {},
  );

  const territoryCache = useRef(new Map<string, string>());

  useEffect(() => {
    const units = unitsPage?.content ?? [];

    const parentIds = [
      ...new Set(
        units
          .map((unit) => unit.parentId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    if (parentIds.length === 0) {
      setParentNames({});
      return;
    }

    let cancelled = false;

    async function loadParentNames() {
      const missingIds = parentIds.filter((id) => !parentCache.current.has(id));

      const results = await Promise.allSettled(
        missingIds.map((id) =>
          organizationalUnitService.getOrganizationalUnitById(id),
        ),
      );

      if (cancelled) return;

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          parentCache.current.set(missingIds[index], result.value.name);
        }
      });

      const names: Record<string, string> = {};

      parentIds.forEach((id) => {
        const name = parentCache.current.get(id);

        if (name) {
          names[id] = name;
        }
      });

      setParentNames(names);
    }

    void loadParentNames();

    return () => {
      cancelled = true;
    };
  }, [unitsPage]);

  useEffect(() => {
    let cancelled = false;

    async function loadUnits() {
      setIsLoading(true);
      setError("");

      try {
        const result = await organizationalUnitService.listOrganizationalUnits(
          page,
          PAGE_SIZE,
        );

        if (!cancelled) {
          setUnitsPage(result);
        }
      } catch (err) {
        if (!cancelled) {
          setUnitsPage(null);
          setError(
            err instanceof Error
              ? err.message
              : "Erro ao carregar unidades organizacionais.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadUnits();

    return () => {
      cancelled = true;
    };
  }, [page, refreshKey, reloadKey]);

  useEffect(() => {
    const units = unitsPage?.content ?? [];

    if (units.length === 0) {
      setTerritoryNames({});
      return;
    }

    let cancelled = false;

    const territorialIds = [
      ...new Set(units.map((unit) => unit.territorialUnitId).filter(Boolean)),
    ];

    async function loadTerritoryNames() {
      const missingIds = territorialIds.filter(
        (id) => !territoryCache.current.has(id),
      );

      const results = await Promise.allSettled(
        missingIds.map((id) =>
          territorialUnitService.getTerritorialUnitById(id),
        ),
      );

      if (cancelled) return;

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          territoryCache.current.set(missingIds[index], result.value.name);
        }
      });

      const names: Record<string, string> = {};

      territorialIds.forEach((id) => {
        const name = territoryCache.current.get(id);

        if (name) {
          names[id] = name;
        }
      });

      setTerritoryNames(names);
    }

    void loadTerritoryNames();

    return () => {
      cancelled = true;
    };
  }, [unitsPage]);

  const units = unitsPage?.content ?? [];
  const totalElements = unitsPage?.totalElements ?? 0;
  const totalPages = unitsPage?.totalPages ?? 0;

  function refresh() {
    setReloadKey((value) => value + 1);
  }

  function previousPage() {
    setPage((current) => Math.max(0, current - 1));
  }

  function nextPage() {
    if (unitsPage && page + 1 < totalPages) {
      setPage((current) => current + 1);
    }
  }

  return (
    <section className="organizational-table-panel">
      <div className="users-table-header">
        <div>
          <h3>Unidades registadas</h3>
          <p>
            {unitsPage
              ? `${totalElements} unidade(s) organizacional(is)`
              : "Consulta da estrutura organizacional"}
          </p>
        </div>

        <button
          type="button"
          className="users-refresh-button"
          onClick={refresh}
          disabled={isLoading}
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="users-table-error" role="alert">
          <p>{error}</p>

          <button type="button" onClick={refresh}>
            Tentar novamente
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="users-table-message" role="status">
          A carregar unidades organizacionais...
        </div>
      ) : !error && units.length === 0 ? (
        <div className="users-table-empty">
          <Network size={32} />

          <strong>Nenhuma unidade organizacional encontrada</strong>

          <p>Ainda não existem unidades nesta página.</p>
        </div>
      ) : !error ? (
        <>
          <div className="users-table-scroll">
            <table className="users-table">
              <thead>
                <tr>
                  <th scope="col">Código</th>
                  <th scope="col">Nome</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Território</th>
                  <th scope="col">Unidade superior</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>

              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id}>
                    <td>
                      <strong>{unit.code}</strong>
                    </td>

                    <td>{unit.name}</td>

                    <td>
                      <span className="users-role">
                        {unit.type.replaceAll("_", " ")}
                      </span>
                    </td>

                    <td>
                      <span
                        title={unit.territorialUnitId}
                        className="org-territory-name"
                      >
                        {territoryNames[unit.territorialUnitId] ??
                          "Território indisponível"}
                      </span>
                    </td>

                    <td>
                      {unit.parentId ? (
                        <span
                          className="org-territory-name"
                          title={unit.parentId}
                        >
                          {parentNames[unit.parentId] ??
                            "Unidade superior indisponível"}
                        </span>
                      ) : (
                        <span className="org-unit-root">
                          Sem unidade superior
                        </span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`users-status ${
                          unit.active
                            ? "users-status-active"
                            : "users-status-inactive"
                        }`}
                      >
                        {unit.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="users-pagination">
            <span>
              Página {page + 1} de {Math.max(1, totalPages)}
            </span>

            <div className="users-pagination-actions">
              <button
                type="button"
                onClick={previousPage}
                disabled={isLoading || page === 0}
              >
                <ChevronLeft size={17} />
                Anterior
              </button>

              <button
                type="button"
                onClick={nextPage}
                disabled={isLoading || !unitsPage || page + 1 >= totalPages}
              >
                Próxima
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
