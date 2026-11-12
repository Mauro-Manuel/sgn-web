
import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";

import AdmissionDecisionForm from "../components/admissions/AdmissionDecisionForm";

export default function AdmissionsPage() {
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <div className="admissions-page">
      <div className="dashboard-heading">
        <h1>Gestão de Admissões</h1>
        <p>
          Registo de decisões sobre pedidos de admissão.
        </p>
      </div>

      {showSuccess && (
        <div className="member-registration-success" role="status">
          <CheckCircle2 size={22} />

          <div className="member-success-content">
            <strong>Decisão registada com sucesso!</strong>
            <p>A decisão foi processada pela API.</p>
          </div>

          <button
            type="button"
            className="member-success-close"
            onClick={() => setShowSuccess(false)}
            aria-label="Fechar notificação"
          >
            <X size={19} />
          </button>
        </div>
      )}

      <AdmissionDecisionForm
        onDecided={() => setShowSuccess(true)}
      />
    </div>
  );
}
