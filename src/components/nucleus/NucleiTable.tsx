
import { useEffect, useRef, useState } from "react";
import {
  Network,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Pencil,
  UserX,
  UserCheck,
} from "lucide-react";

import { nucleusService } from "../../services/nucleusService";
import { organizationalUnitService } from "../../services/organizationalUnitService";

import type { Nucleus } from "../../types/nucleus/Nucleus";

import EditNucleusForm from "./EditNucleusForm";
import NucleusStatusModal from "./NucleusStatusModal";

interface NucleiTableProps {
  refreshKey: number;
  onNucleusUpdated?: () => void;
}

export default function NucleiTable({
  refreshKey,
  onNucleusUpdated,
}: NucleiTableProps) {
  const [nuclei, setNuclei] = useState<Nucleus[]>([]);

  const [organizationNames, setOrganizationNames] = useState<
    Record<string, string>
  >({});

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [editingNucleus, setEditingNucleus] = useState<Nucleus | null>(null);
  const [statusNucleus, setStatusNucleus] = useState<Nucleus | null>(null);

  const organizationCache = useRef(new Map<string, string>());

  function handleNucleusStatusChanged() {
    setStatusNucleus(null);
    setReloadKey((current) => current + 1);
  }

  function handleNucleusUpdated() {
    setEditingNucleus(null);

    // O NucleiPage trata a notificação e a actualização
    // da tabela através do refreshKey.
    if (onNucleusUpdated) {
      onNucleusUpdated();
    } else {
      // Mantém compatibilidade caso o componente
      // seja utilizado sem o callback.
      setReloadKey((current) => current + 1);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadNuclei() {
      setIsLoading(true);
      setError("");

      try {
        const result = await nucleusService.listNuclei();

        if (!cancelled) {
          setNuclei(result);
        }

        const organizationIds = [
          ...new Set(
            result
              .map((nucleus) => nucleus.organizationalUnitId)
              .filter(Boolean),
          ),
        ];

        const missingIds = organizationIds.filter(
          (id) => !organizationCache.current.has(id),
        );

        const organizationResults = await Promise.allSettled(
          missingIds.map((id) =>
            organizationalUnitService.getOrganizationalUnitById(id),
          ),
        );

        if (cancelled) return;

        organizationResults.forEach((item, index) => {
          if (item.status === "fulfilled") {
            organizationCache.current.set(missingIds[index], item.value.name);
          }
        });

        const names: Record<string, string> = {};

        organizationIds.forEach((id) => {
          const name = organizationCache.current.get(id);

          if (name) {
            names[id] = name;
          }
        });

        setOrganizationNames(names);
      } catch (err) {
        if (!cancelled) {
          setNuclei([]);

          setError(
            err instanceof Error
              ? err.message
              : "Erro ao carregar Núcleos.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadNuclei();

    return () => {
      cancelled = true;
    };
  }, [refreshKey, reloadKey]);

  return (
    <>
      <section className="nuclei-table-card">
        <div className="users-table-header">
          <div>
            <h3>Núcleos registados</h3>
            <p>{nuclei.length} Núcleo(s) encontrado(s)</p>
          </div>

          <button
            type="button"
            className="users-refresh-button"
            onClick={() => setReloadKey((value) => value + 1)}
            disabled={isLoading}
          >
            <RefreshCw size={17} />
            Actualizar
          </button>
        </div>

        {error && (
          <div className="users-table-error" role="alert">
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="users-table-message" role="status">
            A carregar Núcleos...
          </div>
        ) : !error && nuclei.length === 0 ? (
          <div className="users-table-empty">
            <Network size={32} />

            <strong>Nenhum Núcleo registado</strong>

            <p>Cria o primeiro Núcleo no formulário abaixo.</p>
          </div>
        ) : !error ? (
          <>
            <div className="users-table-scroll">
              <table className="users-table">
                <thead>
                  <tr>
                    <th scope="col">Código</th>
                    <th scope="col">Nome</th>
                    <th scope="col">Unidade Organizacional</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Acções</th>
                  </tr>
                </thead>

                <tbody>
                  {nuclei.map((nucleus) => (
                    <tr key={nucleus.id}>
                      <td>
                        <strong>{nucleus.code}</strong>
                      </td>

                      <td>{nucleus.name}</td>

                      <td>
                        <span
                          className="org-territory-name"
                          title={nucleus.organizationalUnitId}
                        >
                          {organizationNames[nucleus.organizationalUnitId] ??
                            "Unidade indisponível"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`users-status ${
                            nucleus.active
                              ? "users-status-active"
                              : "users-status-inactive"
                          }`}
                        >
                          {nucleus.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      <td>
                        <div className="nucleus-row-actions">
                          <button
                            type="button"
                            className="nucleus-edit-button"
                            onClick={() => setEditingNucleus(nucleus)}
                          >
                            <Pencil size={17} />
                            Editar
                          </button>

                          {nucleus.active ? (
                            <button
                              type="button"
                              className="nucleus-deactivate-button"
                              onClick={() => setStatusNucleus(nucleus)}
                            >
                              <UserX size={17} />
                              Desactivar
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="nucleus-activate-button"
                              onClick={() => setStatusNucleus(nucleus)}
                            >
                              <UserCheck size={17} />
                              Activar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="users-pagination">
              <span>Página 1 de 1</span>

              <div className="users-pagination-actions">
                <button type="button" disabled>
                  <ChevronLeft size={17} />
                  Anterior
                </button>

                <button type="button" disabled>
                  Próxima
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </>
        ) : null}
      </section>

      {editingNucleus && (
        <EditNucleusForm
          nucleus={editingNucleus}
          onClose={() => setEditingNucleus(null)}
          onUpdated={handleNucleusUpdated}
        />
      )}

      {statusNucleus && (
        <NucleusStatusModal
          nucleus={statusNucleus}
          onClose={() => setStatusNucleus(null)}
          onStatusChanged={handleNucleusStatusChanged}
        />
      )}
    </>
  );
}
