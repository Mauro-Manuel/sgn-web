
import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";

import RegisterMemberForm from "../components/members/RegisterMemberForm";
import MembersTable from "../components/members/MembersTable";

import type { RegisterMemberResponse } from "../types/member/RegisterMemberResponse";

export default function MembersPage() {
  const [registration, setRegistration] =
    useState<RegisterMemberResponse | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  function handleRegistered(result: RegisterMemberResponse) {
    setRegistration(result);
    setRefreshKey(current => current + 1);
  }

  return (
    <div className="members-page">
      <div className="dashboard-heading">
        <h1>Gestão de Militantes</h1>

        <p>
          Registo de candidatos, consulta de militantes
          e acompanhamento de admissões.
        </p>
      </div>

      {registration && (
        <div
          className="member-registration-success"
          role="status"
        >
          <CheckCircle2 size={22} />

          <div className="member-success-content">
            <strong>
              Pedido de admissão registado com sucesso!
            </strong>

            <p>
              Estado:{" "}
              {registration.admissionStatus === "PENDENTE"
                ? "Pendente"
                : registration.admissionStatus}
            </p>
          </div>

          <button
            type="button"
            className="member-success-close"
            onClick={() => setRegistration(null)}
            aria-label="Fechar notificação"
            title="Fechar"
          >
            <X size={19} />
          </button>
        </div>
      )}

      <MembersTable refreshKey={refreshKey} />

      <RegisterMemberForm
        onRegistered={handleRegistered}
      />
    </div>
  );
}
