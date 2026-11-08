
import { useEffect, useState, type FormEvent } from "react";
import { Network, Save } from "lucide-react";

import { nucleusService } from "../../services/nucleusService";
import { organizationalUnitService } from "../../services/organizationalUnitService";

import type { Nucleus } from "../../types/nucleus/Nucleus";
import type { OrganizationalUnit } from "../../types/organizational/OrganizationalUnit";

interface CreateNucleusFormProps {
  onCreated: (nucleus: Nucleus) => void;
}

const PAGE_SIZE = 20;

export default function CreateNucleusForm({
  onCreated,
}: CreateNucleusFormProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [organizationalUnitId, setOrganizationalUnitId] =
    useState("");

  const [organizationalUnits, setOrganizationalUnits] =
    useState<OrganizationalUnit[]>([]);

  const [organizationPage, setOrganizationPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOrganizations, setLoadingOrganizations] =
    useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOrganizations() {
      setLoadingOrganizations(true);

      try {
        const result =
          await organizationalUnitService.listOrganizationalUnits(
            organizationPage,
            PAGE_SIZE
          );

        if (cancelled) return;

        setOrganizationalUnits(current => {
          if (organizationPage === 0) {
            return result.content;
          }

          const existingIds = new Set(
            current.map(unit => unit.id)
          );

          return [
            ...current,
            ...result.content.filter(
              unit => !existingIds.has(unit.id)
            ),
          ];
        });

        setHasMore(!result.last);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Erro ao carregar unidades organizacionais."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingOrganizations(false);
        }
      }
    }

    void loadOrganizations();

    return () => {
      cancelled = true;
    };
  }, [organizationPage]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting) return;

    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();

    if (!trimmedCode || !trimmedName) {
      setError("Preenche o código e o nome.");
      return;
    }

    const selectedOrganization = organizationalUnits.find(
      unit => unit.id === organizationalUnitId && unit.active
    );

    if (!selectedOrganization) {
      setError("Selecciona uma unidade organizacional activa.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const nucleus = await nucleusService.createNucleus({
        code: trimmedCode,
        name: trimmedName,
        organizationalUnitId,
      });

      setCode("");
      setName("");
      setOrganizationalUnitId("");

      onCreated(nucleus);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao criar Núcleo."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeOrganizations = organizationalUnits.filter(
    unit => unit.active
  );

  return (
    <section className="dashboard-panel">
      <div className="territorial-create-heading">
        <Network size={22} />

        <div>
          <h3>Criar Núcleo</h3>
          <p>
            Registar um Núcleo associado a uma
            unidade organizacional do SGN.
          </p>
        </div>
      </div>

      <form
        className="territorial-create-form"
        onSubmit={handleSubmit}
      >
        <div className="field-group">
          <label htmlFor="nucleus-code">
            Código
          </label>

          <input
            id="nucleus-code"
            type="text"
            value={code}
            onChange={event => setCode(event.target.value)}
            maxLength={30}
            placeholder="Ex.: NUC-KIL-001"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="field-group">
          <label htmlFor="nucleus-name">
            Nome
          </label>

          <input
            id="nucleus-name"
            type="text"
            value={name}
            onChange={event => setName(event.target.value)}
            maxLength={150}
            placeholder="Nome do Núcleo"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="field-group">
          <label htmlFor="nucleus-organizational-unit">
            Unidade Organizacional
          </label>

          <select
            id="nucleus-organizational-unit"
            value={organizationalUnitId}
            onChange={event => {
              setOrganizationalUnitId(event.target.value);
              setError("");
            }}
            required
            disabled={isSubmitting || loadingOrganizations && organizationalUnits.length === 0}
          >
            <option value="">
              {loadingOrganizations &&
              organizationalUnits.length === 0
                ? "A carregar unidades..."
                : "Seleccionar unidade organizacional"}
            </option>

            {activeOrganizations.map(unit => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.code})
              </option>
            ))}
          </select>

          {hasMore && (
            <button
              type="button"
              className="users-refresh-button"
              onClick={() => {
                setError("");
                setOrganizationPage(current => current + 1);
              }}
              disabled={loadingOrganizations}
            >
              {loadingOrganizations
                ? "A carregar..."
                : "Carregar mais unidades"}
            </button>
          )}
        </div>

        {error && (
          <p className="change-password-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="submit-button"
          disabled={
            isSubmitting ||
            loadingOrganizations && organizationalUnits.length === 0
          }
        >
          <Save size={17} />

          {isSubmitting
            ? "A criar Núcleo..."
            : "Criar Núcleo"}
        </button>
      </form>
    </section>
  );
}
