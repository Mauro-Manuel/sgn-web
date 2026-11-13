import { useEffect, useState, type FormEvent } from "react";

import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  UsersRound,
} from "lucide-react";

import { memberService } from "../../services/memberService";
import RequestTransferModal from "../transfers/RequestTransferModal";
import { nucleusService } from "../../services/nucleusService";

import type {
  Member,
  MemberSearchStatus,
  AdmissionStatus,
  MemberStatus,
} from "../../types/member/Member";

import type { PageResponse } from "../../types/user/PageResponse";
import MemberDetailsModal from "./MemberDetailsModal";

interface MembersTableProps {
  refreshKey: number;
}

const PAGE_SIZE = 10;

const statusOptions: {
  value: MemberSearchStatus;
  label: string;
}[] = [
  { value: "PENDENTE", label: "Admissão pendente" },
  { value: "ADMITIDO", label: "Admitido" },
  { value: "NAO_ADMITIDO", label: "Não admitido" },
  { value: "ACTIVO", label: "Activo" },
  { value: "INACTIVO", label: "Inactivo" },
  { value: "DESVINCULADO", label: "Desvinculado" },
];

function admissionLabel(status: AdmissionStatus): string {
  switch (status) {
    case "PENDENTE":
      return "Pendente";
    case "ADMITIDO":
      return "Admitido";
    case "NAO_ADMITIDO":
      return "Não admitido";
  }
}

function memberStatusLabel(status: MemberStatus | null): string {
  switch (status) {
    case "ACTIVO":
      return "Activo";
    case "INACTIVO":
      return "Inactivo";
    case "DESVINCULADO":
      return "Desvinculado";
    default:
      return "—";
  }
}

interface TransferTarget {
  memberId: string;
  memberName: string;
  originNucleusId: string;
  originNucleusName: string;
}

interface DestinationNucleus {
  id: string;
  name: string;
}

export default function MembersTable({ refreshKey }: MembersTableProps) {
  const [page, setPage] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<MemberSearchStatus | "">("");

  const [membersPage, setMembersPage] = useState<PageResponse<Member> | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const [transferTarget, setTransferTarget] = useState<TransferTarget | null>(
    null,
  );

  const [isPreparingTransfer, setIsPreparingTransfer] = useState<string | null>(
    null,
  );

  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState("");
  const [destinationNuclei, setDestinationNuclei] = useState<
    DestinationNucleus[]
  >([]);

  useEffect(() => {
    let cancelled = false;

    async function loadMembers() {
      setIsLoading(true);
      setError("");

      try {
        const result = await memberService.listMembers({
          page,
          size: PAGE_SIZE,
          search,
          status,
        });

        if (!cancelled) {
          setMembersPage(result);
        }
      } catch (err) {
        if (!cancelled) {
          setMembersPage(null);

          setError(
            err instanceof Error ? err.message : "Erro ao carregar militantes.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadMembers();

    return () => {
      cancelled = true;
    };
  }, [page, search, status, refreshKey, reloadKey]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextSearch = searchInput.trim();

    setPage(0);
    setSearch(nextSearch);

    if (page === 0 && search === nextSearch) {
      setReloadKey((current) => current + 1);
    }
  }

  function handleStatusChange(value: string) {
    setStatus(value as MemberSearchStatus | "");
    setPage(0);
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPage(0);
    setReloadKey((current) => current + 1);
  }

  async function handleRequestTransfer(member: Member) {
    if (isPreparingTransfer !== null) {
      return;
    }

    setTransferError("");
    setTransferSuccess("");
    setTransferTarget(null);
    setDestinationNuclei([]);
    setIsPreparingTransfer(member.id);

    try {
      const details = await memberService.getMemberById(member.id);

      if (!details.nucleusId) {
        throw new Error(
          "Este militante não possui um Núcleo de origem válido.",
        );
      }

      const nuclei = await nucleusService.listNuclei();

      const availableNuclei = nuclei
        .filter((nucleus) => nucleus.id !== details.nucleusId)
        .map((nucleus) => ({
          id: nucleus.id,
          name: nucleus.name,
        }));

      if (availableNuclei.length === 0) {
        throw new Error(
          "Não existem outros Núcleos disponíveis para transferência.",
        );
      }

      setDestinationNuclei(availableNuclei);
      setTransferTarget({
        memberId: details.id,
        memberName: details.fullName,
        originNucleusId: details.nucleusId,
        originNucleusName: details.nucleusName || "Núcleo não identificado",
      });
    } catch (err) {
      setTransferError(
        err instanceof Error
          ? err.message
          : "Não foi possível preparar a transferência.",
      );
    } finally {
      setIsPreparingTransfer(null);
    }
  }

  const members = membersPage?.content ?? [];
  const totalElements = membersPage?.totalElements ?? 0;
  const totalPages = membersPage?.totalPages ?? 0;

  return (
    <section className="members-table-card">
      <div className="users-table-header">
        <div>
          <h3>Militantes e candidatos registados</h3>
          <p>
            {membersPage
              ? `${totalElements} registo(s) encontrado(s)`
              : "Consulta de militantes e admissões"}
          </p>
        </div>

        <button
          type="button"
          className="users-refresh-button"
          disabled={isLoading}
          onClick={() => setReloadKey((value) => value + 1)}
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </div>

      <form className="members-filters" onSubmit={handleSearch}>
        <div className="members-search-field">
          <label htmlFor="members-search">Pesquisar por nome</label>

          <div className="members-search-input">
            <Search size={18} />

            <input
              id="members-search"
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Ex.: Pedro"
            />
          </div>
        </div>

        <div className="members-status-field">
          <label htmlFor="members-status">Estado</label>

          <select
            id="members-status"
            value={status}
            onChange={(event) => handleStatusChange(event.target.value)}
          >
            <option value="">Todos os estados</option>

            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="members-search-button">
          <Search size={17} />
          Pesquisar
        </button>

        <button
          type="button"
          className="members-clear-button"
          onClick={clearFilters}
        >
          Limpar
        </button>
      </form>

      {transferSuccess && (
        <div className="member-transfer-success" role="status">
          <span>{transferSuccess}</span>

          <button
            type="button"
            onClick={() => setTransferSuccess("")}
            aria-label="Fechar notificação"
          >
            ×
          </button>
        </div>
      )}

      {transferError && (
        <div className="member-transfer-error" role="alert">
          <span>{transferError}</span>

          <button
            type="button"
            onClick={() => setTransferError("")}
            aria-label="Fechar mensagem"
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
            onClick={() => setReloadKey((value) => value + 1)}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="users-table-message" role="status">
          A carregar militantes...
        </div>
      ) : !error && members.length === 0 ? (
        <div className="users-table-empty">
          <UsersRound size={32} />

          <strong>Nenhum registo encontrado</strong>

          <p>
            Não foram encontrados militantes ou candidatos para os filtros
            seleccionados.
          </p>
        </div>
      ) : !error ? (
        <>
          <div className="users-table-scroll">
            <table className="users-table">
              <thead>
                <tr>
                  <th scope="col">Nome completo</th>
                  <th scope="col">Telefone</th>
                  <th scope="col">Núcleo</th>
                  <th scope="col">Admissão</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acções</th>
                </tr>
              </thead>

              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <button
                        type="button"
                        className="member-details-link"
                        onClick={() => setSelectedMemberId(member.id)}
                        aria-label={`Ver detalhes de ${member.fullName}`}
                      >
                        {member.fullName}
                      </button>
                    </td>

                    <td>{member.phoneNumber || "—"}</td>

                    <td>{member.nucleusName}</td>

                    <td>
                      {member.admissionStatus ? (
                        <span
                          className={`member-admission-badge member-admission-${member.admissionStatus.toLowerCase()}`}
                        >
                          {admissionLabel(member.admissionStatus)}
                        </span>
                      ) : (
                        <span className="member-no-status">—</span>
                      )}
                    </td>

                    <td>
                      {member.status ? (
                        <span
                          className={`users-status ${
                            member.status === "ACTIVO"
                              ? "users-status-active"
                              : "users-status-inactive"
                          }`}
                        >
                          {memberStatusLabel(member.status)}
                        </span>
                      ) : (
                        <span className="member-no-status">—</span>
                      )}
                    </td>

                    <td>
                      {member.admissionStatus === "ADMITIDO" &&
                      member.status === "ACTIVO" ? (
                        <button
                          type="button"
                          className="member-transfer-button"
                          onClick={() => {
                            void handleRequestTransfer(member);
                          }}
                          disabled={isPreparingTransfer !== null}
                          title={`Solicitar transferência de ${member.fullName}`}
                        >
                          <ArrowLeftRight size={16} />
                          {isPreparingTransfer === member.id
                            ? "A preparar..."
                            : "Transferir"}
                        </button>
                      ) : (
                        <span className="member-no-status">—</span>
                      )}
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
                disabled={isLoading || page === 0}
                onClick={() => setPage((current) => Math.max(0, current - 1))}
              >
                <ChevronLeft size={17} />
                Anterior
              </button>

              <button
                type="button"
                disabled={isLoading || !membersPage || page + 1 >= totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Próxima
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </>
      ) : null}
      {selectedMemberId && (
        <MemberDetailsModal
          memberId={selectedMemberId}
          onClose={() => setSelectedMemberId(null)}
        />
      )}

      {transferTarget && (
        <RequestTransferModal
          memberId={transferTarget.memberId}
          memberName={transferTarget.memberName}
          originNucleusId={transferTarget.originNucleusId}
          originNucleusName={transferTarget.originNucleusName}
          destinationNuclei={destinationNuclei}
          onClose={() => setTransferTarget(null)}
          onCreated={() => {
            setTransferTarget(null);

            setTransferSuccess(
              "Pedido de transferência registado com sucesso. " +
                "Aguardando decisão do órgão competente.",
            );

            setReloadKey((current) => current + 1);
          }}
        />
      )}
    </section>
  );
}
