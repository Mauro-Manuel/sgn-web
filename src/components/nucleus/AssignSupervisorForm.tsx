
import { useEffect, useState, type FormEvent } from "react";
import { UserRoundCheck } from "lucide-react";

import { nucleusService } from "../../services/nucleusService";
import { supervisorAssignmentService } from "../../services/supervisorAssignmentService";

import type { Nucleus } from "../../types/nucleus/Nucleus";

interface SupervisorOption {
  id: string;
  name: string;
  role: string;
  active: boolean;
}

interface UsersPageResponse {
  content: SupervisorOption[];
  totalPages: number;
}

export default function AssignSupervisorForm() {
  const [supervisors, setSupervisors] =
    useState<SupervisorOption[]>([]);

  const [nuclei, setNuclei] = useState<Nucleus[]>([]);

  const [supervisorId, setSupervisorId] = useState("");
  const [nucleusId, setNucleusId] = useState("");

  const [userPage, setUserPage] = useState(0);
  const [hasMoreUsers, setHasMoreUsers] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadNuclei() {
      try {
        const result = await nucleusService.listNuclei();

        if (!cancelled) {
          setNuclei(result.filter(nucleus => nucleus.active));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Erro ao carregar Núcleos."
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
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSupervisors() {
      setIsLoadingUsers(true);

      try {
        const response = await fetch(
          `/api/v1/users?page=${userPage}&size=20`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Erro ao carregar Supervisores. HTTP ${response.status}`
          );
        }

        const result =
          (await response.json()) as UsersPageResponse;

        if (cancelled) return;

        const available = result.content.filter(
          user =>
            user.active &&
            user.role === "SUPERVISOR_NUCLEO"
        );

        setSupervisors(current => {
          if (userPage === 0) {
            return available;
          }

          const ids = new Set(current.map(user => user.id));

          return [
            ...current,
            ...available.filter(user => !ids.has(user.id)),
          ];
        });

        setHasMoreUsers(userPage + 1 < result.totalPages);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Erro ao carregar Supervisores."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingUsers(false);
        }
      }
    }

    void loadSupervisors();

    return () => {
      cancelled = true;
    };
  }, [userPage]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    if (!supervisorId || !nucleusId) {
      setError("Selecciona um Supervisor e um Núcleo.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await supervisorAssignmentService.assignSupervisor({
        supervisorId,
        nucleusId,
      });

      setSuccess("Supervisor atribuído ao Núcleo com sucesso!");
      setSupervisorId("");
      setNucleusId("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao atribuir Supervisor."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="member-form-card">
      <div className="territorial-create-heading">
        <UserRoundCheck size={22} />

        <div>
          <h3>Atribuir Supervisor</h3>
          <p>
            Associar um Supervisor de Núcleo a um
            Núcleo activo.
          </p>
        </div>
      </div>

      <form
        className="territorial-create-form"
        onSubmit={handleSubmit}
      >
        <div className="field-group">
          <label htmlFor="assign-supervisor">
            Supervisor *
          </label>

          <select
            id="assign-supervisor"
            value={supervisorId}
            onChange={event =>
              setSupervisorId(event.target.value)
            }
            required
            disabled={isSubmitting || isLoadingUsers && supervisors.length === 0}
          >
            <option value="">
              Seleccionar Supervisor
            </option>

            {supervisors.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>

          {hasMoreUsers && (
            <button
              type="button"
              className="users-refresh-button"
              disabled={isLoadingUsers}
              onClick={() =>
                setUserPage(current => current + 1)
              }
            >
              Carregar mais Supervisores
            </button>
          )}
        </div>

        <div className="field-group">
          <label htmlFor="assign-nucleus">
            Núcleo *
          </label>

          <select
            id="assign-nucleus"
            value={nucleusId}
            onChange={event =>
              setNucleusId(event.target.value)
            }
            required
            disabled={isSubmitting || isLoading}
          >
            <option value="">
              Seleccionar Núcleo
            </option>

            {nuclei.map(nucleus => (
              <option key={nucleus.id} value={nucleus.id}>
                {nucleus.name} ({nucleus.code})
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="change-password-error" role="alert">
            {error}
          </p>
        )}

        {success && (
          <div
            className="member-registration-success"
            role="status"
          >
            <span>{success}</span>

            <button
              type="button"
              className="member-success-close"
              aria-label="Fechar notificação"
              onClick={() => setSuccess("")}
            >
              ×
            </button>
          </div>
        )}

        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || isLoading || isLoadingUsers}
        >
          <UserRoundCheck size={17} />

          {isSubmitting
            ? "A atribuir..."
            : "Atribuir Supervisor"}
        </button>
      </form>
    </section>
  );
}
