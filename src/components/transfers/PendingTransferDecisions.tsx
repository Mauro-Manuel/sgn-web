
import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
} from "lucide-react";

import { transferService } from "../../services/transferService";
import TransferDecisionModal from "./TransferDecisionModal";

import type {
  TransferDetail,
  TransferPage,
} from "../../types/transfer/TransferDetail";

const PAGE_SIZE = 10;

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

export default function PendingTransferDecisions() {
  const [page, setPage] = useState(0);

  const [result, setResult] =
    useState<TransferPage | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedTransfer, setSelectedTransfer] =
    useState<TransferDetail | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPendingTransfers() {
      setIsLoading(true);
      setError("");

      try {
        const data =
          await transferService.listPendingTransferDecisions(
            page,
            PAGE_SIZE,
            controller.signal
          );

        if (controller.signal.aborted) return;

        setResult(data);
      } catch (err) {
        if (controller.signal.aborted) return;

        setResult(null);
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

    void loadPendingTransfers();

    return () => controller.abort();
  }, [page, refreshKey]);

  const transfers = result?.content ?? [];
  const totalElements = result?.totalElements ?? 0;
  const totalPages = result?.totalPages ?? 0;

  function handleDecisionCompleted(
    decision: "APROVADA" | "REJEITADA"
  ) {
    setSelectedTransfer(null);

    setSuccess(
      decision === "APROVADA"
        ? "Transferência aprovada com sucesso."
        : "Transferência rejeitada com sucesso."
    );

    // Se era a última linha da página, regressamos
    // à página anterior para evitar uma página vazia.
    if (transfers.length === 1 && page > 0) {
      setPage(current => current - 1);
    } else {
      setRefreshKey(current => current + 1);
    }
  }

  return (
    <section className="pending-transfers">
      <div className="pending-transfers-header">
        <div className="pending-transfers-heading">
          <ArrowLeftRight size={21} />

          <div>
            <h3>Transferências Pendentes</h3>
            <p>
              Pedidos que aguardam decisão do órgão competente.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="users-refresh-button"
          disabled={isLoading}
          onClick={() => setRefreshKey(value => value + 1)}
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      {success && (
        <div className="member-transfer-success" role="status">
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
            onClick={() => setRefreshKey(value => value + 1)}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="users-table-message" role="status">
          A carregar transferências pendentes...
        </div>
      ) : !error && transfers.length === 0 ? (
        <div className="users-table-empty">
          <ArrowLeftRight size={30} />

          <strong>Sem transferências pendentes</strong>

          <p>
            Não existem pedidos de transferência
            a aguardar a tua decisão.
          </p>
        </div>
      ) : !error ? (
        <div className="users-table-scroll">
          <table className="users-table">
            <thead>
              <tr>
                <th scope="col">Militante</th>
                <th scope="col">Origem / Destino</th>
                <th scope="col">Data do pedido</th>
                <th scope="col">Estado</th>
                <th scope="col">Acções</th>
              </tr>
            </thead>

            <tbody>
              {transfers.map(transfer => (
                <tr key={transfer.id}>
                  <td>
                    <strong>{transfer.memberName}</strong>
                  </td>

                  <td>
                    <div className="pending-transfer-route">
                      <span>{transfer.sourceNucleusName}</span>
                      <span aria-hidden="true">↓</span>
                      <span>
                        {transfer.destinationNucleusName}
                      </span>
                    </div>
                  </td>

                  <td>
                    {formatDate(transfer.requestedAt)}
                  </td>

                  <td>
                    <span className="transfer-status transfer-status-pending">
                      Pendente
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="audit-details-button"
                      onClick={() =>
                        setSelectedTransfer(transfer)
                      }
                      disabled={transfer.status !== "PENDENTE"}
                    >
                      <Eye size={16} />
                      Decidir
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
                setPage(current => Math.max(0, current - 1))
              }
            >
              <ChevronLeft size={17} />
              Anterior
            </button>

            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() =>
                setPage(current => current + 1)
              }
            >
              Próxima
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      )}

      {selectedTransfer && (
        <TransferDecisionModal
          transfer={selectedTransfer}
          onClose={() => setSelectedTransfer(null)}
          onDecided={handleDecisionCompleted}
        />
      )}
    </section>
  );
}
