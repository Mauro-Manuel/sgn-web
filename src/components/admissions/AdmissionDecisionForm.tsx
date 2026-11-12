
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { ClipboardCheck, RefreshCw } from "lucide-react";

import { admissionService } from "../../services/admissionService";

import type {
  AdmissionDecision,
} from "../../types/admission/AdmissionDecisionRequest";

import type {
  AdmissionListResponse,
} from "../../types/admission/AdmissionListResponse";

interface AdmissionDecisionFormProps {
  onDecided: () => void;
}

export default function AdmissionDecisionForm({
  onDecided,
}: AdmissionDecisionFormProps) {
  const [admissions, setAdmissions] = useState<
    AdmissionListResponse[]
  >([]);

  const [admissionId, setAdmissionId] = useState("");
  const [decision, setDecision] =
    useState<AdmissionDecision | "">("");
  const [decisionReference, setDecisionReference] =
    useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAdmissions() {
      setIsLoading(true);
      setError("");

      try {
        const result =
          await admissionService.listAllPendingAdmissions(
            controller.signal
          );

        if (controller.signal.aborted) return;

        setAdmissions(result);

        setAdmissionId(current =>
          result.some(item => item.id === current)
            ? current
            : ""
        );
      } catch (err) {
        if (controller.signal.aborted) return;

        setAdmissions([]);

        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os pedidos."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadAdmissions();

    return () => controller.abort();
  }, [refreshKey]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSubmitting || isLoading) return;

    const reference = decisionReference.trim();

    if (!admissionId || !decision || !reference) {
      setError("Preenche todos os campos obrigatórios.");
      return;
    }

    if (
      !admissions.some(
        item => item.id === admissionId
      )
    ) {
      setError("Selecciona um pedido de admissão válido.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await admissionService.decideAdmission(
        admissionId,
        {
          decision,
          decisionReference: reference,
        }
      );

      setAdmissionId("");
      setDecision("");
      setDecisionReference("");

      onDecided();

      // Actualiza o select após a decisão.
      setRefreshKey(current => current + 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível registar a decisão."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedAdmission = admissions.find(
    item => item.id === admissionId
  );

  return (
    <section className="admission-form-card">
      <div className="territorial-create-heading">
        <ClipboardCheck size={22} />

        <div>
          <h3>Registar decisão de admissão</h3>
          <p>
            Selecciona um candidato com admissão pendente.
          </p>
        </div>
      </div>

      <form
        className="territorial-create-form"
        onSubmit={handleSubmit}
      >
        <div className="field-group">
          <label htmlFor="admission-request">
            Pedido de admissão *
          </label>

          <select
            id="admission-request"
            value={admissionId}
            onChange={event => {
              setAdmissionId(event.target.value);
              setError("");
            }}
            required
            disabled={
              isLoading ||
              isSubmitting ||
              admissions.length === 0
            }
          >
            <option value="">
              {isLoading
                ? "A carregar pedidos..."
                : admissions.length === 0
                  ? "Nenhum pedido pendente"
                  : "Seleccionar candidato..."}
            </option>

            {admissions.map(admission => (
              <option
                key={admission.id}
                value={admission.id}
              >
                {admission.memberName} —{" "}
                {admission.nucleusName}
              </option>
            ))}
          </select>

          <small>
            {admissions.length} pedido(s) pendente(s)
          </small>
        </div>

        {selectedAdmission && (
          <div className="admission-selected-info">
            <strong>Candidato seleccionado</strong>

            <p>{selectedAdmission.memberName}</p>

            <small>
              Núcleo: {selectedAdmission.nucleusName}
            </small>
          </div>
        )}

        <div className="field-group">
          <label htmlFor="admission-decision">
            Decisão *
          </label>

          <select
            id="admission-decision"
            value={decision}
            onChange={event =>
              setDecision(
                event.target.value as
                  AdmissionDecision | ""
              )
            }
            required
            disabled={isSubmitting || !admissionId}
          >
            <option value="">Seleccionar decisão</option>
            <option value="ADMITIDO">
              Admitir candidato
            </option>
            <option value="NAO_ADMITIDO">
              Não admitir candidato
            </option>
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="admission-reference">
            Referência da decisão *
          </label>

          <input
            id="admission-reference"
            value={decisionReference}
            onChange={event =>
              setDecisionReference(event.target.value)
            }
            placeholder="Ex.: DEL-2026-001"
            required
            disabled={isSubmitting || !admissionId}
          />
        </div>

        {error && (
          <p
            className="change-password-error"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="admission-form-actions">
          <button
            type="button"
            className="admission-refresh-button"
            onClick={() =>
              setRefreshKey(current => current + 1)
            }
            disabled={isLoading || isSubmitting}
          >
            <RefreshCw size={16} />
            Actualizar pedidos
          </button>

          <button
            type="submit"
            className="submit-button"
            disabled={
              isSubmitting ||
              isLoading ||
              !admissionId ||
              !decision ||
              !decisionReference.trim()
            }
          >
            <ClipboardCheck size={17} />

            {isSubmitting
              ? "A registar decisão..."
              : "Registar decisão"}
          </button>
        </div>
      </form>
    </section>
  );
}
