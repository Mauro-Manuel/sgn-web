
import { useEffect, useState, type FormEvent } from "react";
import {
  Network,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { competentBodyService } from "../services/competentBodyService";
import { transferCompetentBodyService } from "../services/transferCompetentBodyService";

import type { TransferDetail, TransferPage } from "../types/transfer/TransferDetail";

const PAGE_SIZE = 10;

interface BodyOption {
  id: string;
  name: string;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: "Africa/Luanda",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function TransferRoutingPage() {
  const [page, setPage] = useState(0);
  const [result, setResult] =
    useState<TransferPage | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedTransfer, setSelectedTransfer] =
    useState<TransferDetail | null>(null);

  const [bodies, setBodies] = useState<BodyOption[]>([]);
  const [isLoadingBodies, setIsLoadingBodies] =
    useState(false);

  const [competentBodyId, setCompetentBodyId] =
    useState("");

  const [designationReference, setDesignationReference] =
    useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadTransfers() {
      setIsLoading(true);
      setError("");

      try {
        const response =
          await transferCompetentBodyService.listPendingRouting(
            page,
            PAGE_SIZE,
            controller.signal
          );

        if (!controller.signal.aborted) {
          setResult(response);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setResult(null);
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar transferências."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadTransfers();

    return () => controller.abort();
  }, [page, refreshKey]);

  useEffect(() => {
    if (!selectedTransfer) return;

    let cancelled = false;

    async function loadBodies() {
      setIsLoadingBodies(true);
      setFormError("");

      try {
        const options: BodyOption[] = [];
        let currentPage = 0;
        let totalPages = 1;

        while (currentPage < totalPages) {
          const response =
            await competentBodyService.listCompetentBodies(
              currentPage,
              50
            );

          if (cancelled) return;

          options.push(
            ...response.content
              .filter((body) => body.active !== false)
              .map((body) => ({
                id: body.id,
                name: body.name,
              }))
          );

          totalPages = response.totalPages;
          currentPage += 1;
        }

        if (!cancelled) {
          setBodies(options);
        }
      } catch (err) {
        if (cancelled) return;

        setFormError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os órgãos competentes."
        );
      } finally {
        if (!cancelled) {
          setIsLoadingBodies(false);
        }
      }
    }

    void loadBodies();

    return () => {
      cancelled = true;
    };
  }, [selectedTransfer]);

  useEffect(() => {
    if (!selectedTransfer) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        setSelectedTransfer(null);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () =>
      document.removeEventListener("keydown", handleEscape);
  }, [selectedTransfer, isSubmitting]);

  const transfers = result?.content ?? [];
  const totalElements = result?.totalElements ?? 0;
  const totalPages = result?.totalPages ?? 0;

  function openRouting(transfer: TransferDetail) {
    setBodies([]);
    setCompetentBodyId("");
    setDesignationReference("");
    setFormError("");
    setSelectedTransfer(transfer);
  }

  function closeRouting() {
    if (isSubmitting) return;
    setSelectedTransfer(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selectedTransfer || isSubmitting) return;

    const reference = designationReference.trim();

    if (
      !bodies.some((body) => body.id === competentBodyId)
    ) {
      setFormError(
        "Selecciona um órgão competente válido."
      );
      return;
    }

    if (!reference || reference.length > 150) {
      setFormError(
        "A referência deve conter entre 1 e 150 caracteres."
      );
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    setSuccess("");

    try {
      await transferCompetentBodyService.assignCompetentBody(
        selectedTransfer.id,
        {
          competentBodyId,
          designationReference: reference,
        }
      );

      setSelectedTransfer(null);

      setSuccess(
        "Órgão competente designado com sucesso. " +
        "A transferência poderá seguir para decisão."
      );

      if (transfers.length === 1 && page > 0) {
        setPage((current) => current - 1);
      } else {
        setRefreshKey((current) => current + 1);
      }
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "Não foi possível designar o órgão competente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="transfer-routing-page">
      <div className="dashboard-heading">
        <h1>Encaminhamento de Transferências</h1>
        <p>
          Designação dos órgãos competentes
          para decisão dos pedidos.
        </p>
      </div>

      <section className="transfer-routing-card">
        <div className="transfer-routing-header">
          <div className="transfer-routing-heading">
            <Network size={23} />
            <div>
              <h3>Transferências por encaminhar</h3>
              <p>
                {totalElements} pedido(s) encontrado(s)
              </p>
            </div>
          </div>

          <button
            type="button"
            className="users-refresh-button"
            onClick={() =>
              setRefreshKey((value) => value + 1)
            }
            disabled={isLoading}
          >
            <RefreshCw size={17} />
            Actualizar
          </button>
        </div>

        {success && (
          <div
            className="member-transfer-success"
            role="status"
          >
            <span>{success}</span>
            <button
              type="button"
              onClick={() => setSuccess("")}
              aria-label="Fechar notificação"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="users-table-error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={() =>
                setRefreshKey((value) => value + 1)
              }
            >
              Tentar novamente
            </button>
          </div>
        )}

        {isLoading ? (
          <div
            className="users-table-message"
            role="status"
          >
            A carregar transferências...
          </div>
        ) : !error && transfers.length === 0 ? (
          <div className="users-table-empty">
            <Network size={30} />
            <strong>
              Sem transferências por encaminhar
            </strong>
            <p>
              Não existem pedidos a aguardar
              designação de órgão competente.
            </p>
          </div>
        ) : !error ? (
          <div className="users-table-scroll">
            <table className="users-table">
              <thead>
                <tr>
                  <th scope="col">Militante</th>
                  <th scope="col">Origem</th>
                  <th scope="col">Destino</th>
                  <th scope="col">Pedido</th>
                  <th scope="col">Acções</th>
                </tr>
              </thead>

              <tbody>
                {transfers.map((transfer) => (
                  <tr key={transfer.id}>
                    <td>{transfer.memberName}</td>
                    <td>
                      {transfer.sourceNucleusName}
                    </td>
                    <td>
                      {transfer.destinationNucleusName}
                    </td>
                    <td>
                      {formatDate(transfer.requestedAt)}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="member-transfer-button"
                        onClick={() =>
                          openRouting(transfer)
                        }
                      >
                        <Network size={16} />
                        Designar órgão
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!isLoading && !error && totalElements > 0 && (
          <div className="users-pagination">
            <span>
              A mostrar{" "}
              {page * PAGE_SIZE + transfers.length} de{" "}
              {totalElements} registos
            </span>

            <div className="users-pagination-actions">
              <button
                type="button"
                disabled={page === 0}
                onClick={() =>
                  setPage((current) =>
                    Math.max(0, current - 1)
                  )
                }
              >
                <ChevronLeft size={17} />
                Anterior
              </button>

              <button
                type="button"
                disabled={page + 1 >= totalPages}
                onClick={() =>
                  setPage((current) => current + 1)
                }
              >
                Próxima
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </section>

      {selectedTransfer && (
        <div
          className="transfer-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeRouting();
            }
          }}
        >
          <section
            className="transfer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="routing-modal-title"
          >
            <div className="transfer-modal-header">
              <div className="transfer-modal-heading">
                <Network size={23} />
                <div>
                  <h2 id="routing-modal-title">
                    Designar Órgão Competente
                  </h2>
                  <p>
                    Encaminhamento de transferência.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="transfer-modal-close"
                onClick={closeRouting}
                disabled={isSubmitting}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="transfer-member-summary">
              <div>
                <span>Militante</span>
                <strong>
                  {selectedTransfer.memberName}
                </strong>
              </div>

              <div>
                <span>Origem / Destino</span>
                <strong>
                  {selectedTransfer.sourceNucleusName}
                  {" → "}
                  {selectedTransfer.destinationNucleusName}
                </strong>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="transfer-field">
                <label htmlFor="routing-body">
                  Órgão competente *
                </label>

                <select
                  id="routing-body"
                  value={competentBodyId}
                  onChange={(event) =>
                    setCompetentBodyId(event.target.value)
                  }
                  required
                  disabled={
                    isSubmitting || isLoadingBodies
                  }
                >
                  <option value="">
                    {isLoadingBodies
                      ? "A carregar órgãos..."
                      : "Seleccionar órgão competente"}
                  </option>

                  {bodies.map((body) => (
                    <option key={body.id} value={body.id}>
                      {body.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="transfer-field">
                <label htmlFor="routing-reference">
                  Referência da designação *
                </label>

                <input
                  id="routing-reference"
                  type="text"
                  value={designationReference}
                  onChange={(event) =>
                    setDesignationReference(
                      event.target.value
                    )
                  }
                  maxLength={150}
                  placeholder="Ex.: DES-TRF-2026-001"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {bodies.length === 0 &&
                !isLoadingBodies &&
                !formError && (
                  <p
                    className="transfer-error"
                    role="status"
                  >
                    Não existem órgãos competentes
                    disponíveis.
                  </p>
                )}

              {formError && (
                <p
                  className="transfer-error"
                  role="alert"
                >
                  {formError}
                </p>
              )}

              <div className="transfer-modal-actions">
                <button
                  type="button"
                  className="transfer-cancel-button"
                  onClick={closeRouting}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="transfer-submit-button"
                  disabled={
                    isSubmitting ||
                    isLoadingBodies ||
                    !competentBodyId ||
                    !designationReference.trim()
                  }
                >
                  {isSubmitting
                    ? "A encaminhar..."
                    : "Confirmar designação"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
