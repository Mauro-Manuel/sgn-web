
import { useState } from "react";
import { CheckCircle2, Network } from "lucide-react";

import OrganizationalUnitForm from "../../components/settings/OrganizationalUnitForm";
import OrganizationalUnitsTable from "../../components/settings/OrganizationalUnitsTable";

export default function OrganizationalUnitsPage() {
  const [successMessage, setSuccessMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  function handleCreated() {
    setSuccessMessage(
      "Unidade organizacional criada com sucesso!"
    );

    setRefreshKey(current => current + 1);
  }

  return (
    <div className="organizational-page">
      <div className="territorial-header">
        <div>
          <h2>Unidades Organizacionais</h2>
          <p>
            Gestão da estrutura organizacional do SGN
            e das respectivas associações territoriais.
          </p>
        </div>

        <Network size={26} color="#087a41" />
      </div>

      {successMessage && (
        <div className="user-created-success" role="status">
          <CheckCircle2 size={22} />
          <strong>{successMessage}</strong>
        </div>
      )}

      <OrganizationalUnitsTable refreshKey={refreshKey} />

      <OrganizationalUnitForm
        onCreated={handleCreated}
      />
    </div>
  );
}
