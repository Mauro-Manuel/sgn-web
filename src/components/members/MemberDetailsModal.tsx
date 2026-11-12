import { useEffect, useState } from "react";
import {
  UserRound,
  Phone,
  Mail,
  Network,
  ClipboardCheck,
  Activity,
  X,
} from "lucide-react";

import { memberService } from "../../services/memberService";
import type { MemberDetails } from "../../types/member/MemberDetails";
import MemberAdmissionHistory from "./MemberAdmissionHistory";
import MemberAssignmentHistory from "./MemberAssignmentHistory";

interface MemberDetailsModalProps {
  memberId: string;
  onClose: () => void;
}

const admissionLabels: Record<string, string> = {
  PENDENTE: "Pendente",
  ADMITIDO: "Admitido",
  NAO_ADMITIDO: "Não admitido",
};

const statusLabels: Record<string, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  DESVINCULADO: "Desvinculado",
};

export default function MemberDetailsModal({
  memberId,
  onClose,
}: MemberDetailsModalProps) {
  const [member, setMember] = useState<MemberDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadMember() {
      setIsLoading(true);
      setMember(null);
      setError("");

      try {
        const result = await memberService.getMemberById(
          memberId,
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setMember(result);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Erro ao carregar os detalhes do militante.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadMember();

    return () => controller.abort();
  }, [memberId]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="member-details-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="member-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-details-title"
      >
        <div className="member-details-header">
          <div className="member-details-heading">
            <UserRound size={23} />

            <div>
              <h2 id="member-details-title">Detalhes do Militante</h2>
              <p>Informações pessoais e situação no SGN.</p>
            </div>
          </div>

          <button
            type="button"
            className="member-details-close"
            onClick={onClose}
            aria-label="Fechar detalhes"
          >
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <p className="member-details-message" role="status">
            A carregar informações do militante...
          </p>
        ) : error ? (
          <p className="change-password-error" role="alert">
            {error}
          </p>
        ) : member ? (
          <div className="member-details-content">
            {/* COLUNA ESQUERDA - DADOS PESSOAIS */}
            <div className="member-details-personal">
              <div className="member-details-name">
                <UserRound size={23} />

                <div>
                  <strong>{member.fullName}</strong>
                  <span>Registo do militante</span>
                </div>
              </div>

              <div className="member-details-grid">
                <div className="member-details-field">
                  <label>
                    <Phone size={15} />
                    Telefone
                  </label>

                  <p>{member.phoneNumber || "Não informado"}</p>
                </div>

                <div className="member-details-field">
                  <label>
                    <Mail size={15} />
                    Email
                  </label>

                  <p>{member.email || "Não informado"}</p>
                </div>

                <div className="member-details-field">
                  <label>
                    <Network size={15} />
                    Núcleo
                  </label>

                  <p>{member.nucleusName || "Sem Núcleo associado"}</p>
                </div>

                <div className="member-details-field">
                  <label>
                    <ClipboardCheck size={15} />
                    Admissão
                  </label>

                  <span
                    className={`member-admission-badge member-admission-${member.admissionStatus.toLowerCase()}`}
                  >
                    {admissionLabels[member.admissionStatus] ??
                      member.admissionStatus}
                  </span>
                </div>

                <div className="member-details-field">
                  <label>
                    <Activity size={15} />
                    Estado
                  </label>

                  <span
                    className={`member-details-status member-details-status-${member.status.toLowerCase()}`}
                  >
                    {statusLabels[member.status] ?? member.status}
                  </span>
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA - HISTÓRICO */}

            <div className="member-details-history-column">
              <div className="member-details-history-panel">
                <MemberAdmissionHistory memberId={member.id} />
              </div>

              <div className="member-details-history-panel">
                <MemberAssignmentHistory memberId={member.id} />
              </div>
            </div>
          </div>
        ) : null}

        <div className="member-details-actions">
          <button
            type="button"
            className="nucleus-cancel-button"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </section>
    </div>
  );
}
