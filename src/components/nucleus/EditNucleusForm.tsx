import { useEffect, useState, type FormEvent } from "react";
import { Save, X } from "lucide-react";

import { nucleusService } from "../../services/nucleusService";
import type { Nucleus } from "../../types/nucleus/Nucleus";

import { competentBodyService } from "../../services/competentBodyService";

import type { CompetentBody } from "../../types/competentBody/CompetentBody";

interface EditNucleusFormProps {
  nucleus: Nucleus;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditNucleusForm({
  nucleus,
  onClose,
  onUpdated,
}: EditNucleusFormProps) {
  const [name, setName] = useState(nucleus.name);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [competentBodies, setCompetentBodies] = useState<CompetentBody[]>([]);

  const [competentBodyId, setCompetentBodyId] = useState("");

  const [isLoadingBodies, setIsLoadingBodies] = useState(true);

  const [bodiesError, setBodiesError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCompetentBodies() {
      setIsLoadingBodies(true);
      setBodiesError("");

      try {
        const allBodies: CompetentBody[] = [];
        let currentPage = 0;
        let totalPages = 1;

        do {
          const result = await competentBodyService.listCompetentBodies(
            currentPage,
            50,
          );

          if (!active) return;

          allBodies.push(...result.content);

          totalPages = result.totalPages;
          currentPage++;
        } while (currentPage < totalPages);

        if (active) {
          setCompetentBodies(allBodies);
        }
      } catch (error) {
        if (active) {
          setBodiesError(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os Órgãos Competentes.",
          );
        }
      } finally {
        if (active) {
          setIsLoadingBodies(false);
        }
      }
    }

    void loadCompetentBodies();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setName(nucleus.name);
    setError("");
  }, [nucleus.id, nucleus.name]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving) return;

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("O nome do Núcleo é obrigatório.");
      return;
    }

    if (trimmedName.length > 150) {
      setError("O nome não pode exceder 150 caracteres.");
      return;
    }

    const nameChanged = trimmedName !== nucleus.name;
    const competentBodySelected = competentBodyId !== "";

    // Não enviar PATCH se não existir nenhuma alteração.
    if (!nameChanged && !competentBodySelected) {
      onClose();
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await nucleusService.updateNucleus(nucleus.id, {
        name: trimmedName,
        ...(competentBodySelected ? { competentBodyId } : {}),
      });

      onUpdated();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao actualizar o Núcleo.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className="nucleus-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) {
          onClose();
        }
      }}
    >
      <section
        className="nucleus-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-nucleus-title"
      >
        <div className="nucleus-modal-header">
          <div>
            <h2 id="edit-nucleus-title">Editar Núcleo</h2>
            <p>Actualizar o nome do Núcleo.</p>
          </div>

          <button
            type="button"
            className="nucleus-modal-close"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="nucleus-modal-field">
            <label htmlFor="edit-nucleus-code">Código</label>
            <input id="edit-nucleus-code" value={nucleus.code} disabled />
          </div>

          <div className="nucleus-modal-field">
            <label htmlFor="edit-nucleus-name">Nome do Núcleo</label>
            <input
              id="edit-nucleus-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={150}
              required
              autoFocus
              disabled={isSaving}
            />
          </div>

          <div className="nucleus-modal-field">
            <label htmlFor="edit-nucleus-competent-body">
              Órgão Competente
            </label>

            <select
              id="edit-nucleus-competent-body"
              value={competentBodyId}
              onChange={(event) => setCompetentBodyId(event.target.value)}
              disabled={isLoadingBodies || isSaving}
            >
              <option value="">
                {isLoadingBodies
                  ? "A carregar Órgãos Competentes..."
                  : "Manter órgão competente actual"}
              </option>

              {competentBodies.map((body) => (
                <option key={body.id} value={body.id}>
                  {body.name} ({body.code})
                </option>
              ))}
            </select>

            {bodiesError && (
              <p className="change-password-error" role="alert">
                {bodiesError}
              </p>
            )}
          </div>

          {error && (
            <p className="change-password-error" role="alert">
              {error}
            </p>
          )}

          <div className="nucleus-modal-actions">
            <button
              type="button"
              className="nucleus-cancel-button"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="nucleus-save-button"
              disabled={isSaving}
            >
              <Save size={17} />
              {isSaving ? "A guardar..." : "Guardar alterações"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
