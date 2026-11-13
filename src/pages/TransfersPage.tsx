import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
} from "lucide-react";

import { transferService } from "../services/transferService";
import TransferDetailsModal from "../components/transfers/TransferDetailsModal";


import type {
  TransferDetail,
  TransferPage,
  TransferStatus,
} from "../types/transfer/TransferDetail";

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

function statusLabel(status: TransferStatus): string {
  switch (status) {
    case "PENDENTE":
      return "Pendente";

    case "APROVADA":
      return "Aprovada";

    case "REJEITADA":
      return "Rejeitada";
  }
}

export default function TransfersPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");

  const [result, setResult] = useState<TransferPage | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadTransfers() {
      setIsLoading(true);
      setError("");

      try {
        const data = await transferService.listTransfers(
          {
            page,
            size: PAGE_SIZE,
            status,
          },
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setResult(data);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setResult(null);
          setError(
            err instanceof Error
              ? err.message
              : "Erro ao consultar transferências.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadTransfers();

    return () => controller.abort();
  }, [page, status, refreshKey]);

  const transfers: TransferDetail[] = result?.content ?? [];
  const totalPages = result?.totalPages ?? 0;
  const totalElements = result?.totalElements ?? 0;

  function handleStatusChange(value: string) {
    setPage(0);
    setStatus(value);
  }

  return (
    <div className="transfers-page">
      <div className="dashboard-heading">
        <h1>Transferências</h1>
        <p>
          Consulta e acompanhamento dos pedidos de transferência entre Núcleos.
        </p>
      </div>

      <section className="transfers-card">
        <div className="transfers-header">
          <div className="transfers-heading">
            <ArrowLeftRight size={23} />

            <div>
              <h3>Pedidos de transferência</h3>
              <p>{totalElements} registo(s) encontrado(s)</p>
            </div>
          </div>

          <button
            type="button"
            className="users-refresh-button"
            disabled={isLoading}
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            <RefreshCw size={17} />
            Actualizar
          </button>
        </div>

        <div className="transfers-filters">
          <div className="transfers-filter-field">
            <label htmlFor="transfer-status">Estado</label>

            <select
              id="transfer-status"
              value={status}
              onChange={(event) => handleStatusChange(event.target.value)}
            >
              <option value="">Todos os estados</option>
              <option value="PENDENTE">Pendente</option>
              <option value="APROVADA">Aprovada</option>
              <option value="REJEITADA">Rejeitada</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="users-table-error" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setRefreshKey((value) => value + 1)}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="users-table-message" role="status">
            A carregar transferências...
          </div>
        ) : !error && transfers.length === 0 ? (
          <div className="users-table-empty">
            <ArrowLeftRight size={32} />
            <strong>Nenhuma transferência encontrada</strong>
            <p>Não existem pedidos para o filtro seleccionado.</p>
          </div>
        ) : !error ? (
          <div className="users-table-scroll">
            <table className="users-table">
              <thead>
                <tr>
                  <th scope="col">Militante</th>
                  <th scope="col">Origem</th>
                  <th scope="col">Destino</th>
                  <th scope="col">Data do pedido</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acções</th>
                </tr>
              </thead>

              <tbody>
                {transfers.map((transfer) => (
                  <tr key={transfer.id}>
                    <td>{transfer.memberName}</td>

                    <td>{transfer.sourceNucleusName}</td>

                    <td>{transfer.destinationNucleusName}</td>

                    <td>{formatDate(transfer.requestedAt)}</td>

                    <td>
                      <span
                        className={
                          transfer.status === "PENDENTE"
                            ? "transfer-status transfer-status-pending"
                            : "transfer-status transfer-status-other"
                        }
                      >
                        {statusLabel(transfer.status)}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="audit-details-button"
                        onClick={() => setSelectedTransferId(transfer.id)}
                      >
                        <Eye size={16} />
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="users-pagination">
          <span>
            A mostrar{" "}
            {transfers.length === 0 ? 0 : page * PAGE_SIZE + transfers.length}{" "}
            de {totalElements} registos
          </span>

          <div className="users-pagination-actions">
            <button
              type="button"
              disabled={isLoading || page === 0}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
            >
              <ChevronLeft size={17} />
              Anterior
            </button>

            <button
              type="button"
              disabled={isLoading || !result || page + 1 >= totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              Próxima
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {selectedTransferId && (
        <TransferDetailsModal
          transferId={selectedTransferId}
          onClose={() => setSelectedTransferId(null)}
        />
      )}
    </div>
  );
}
