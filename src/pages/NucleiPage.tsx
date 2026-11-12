
import { useState } from "react";
import { CheckCircle2, X } from "lucide-react";

import CreateNucleusForm from "../components/nucleus/CreateNucleusForm";
import NucleiTable from "../components/nucleus/NucleiTable";
import AssignSupervisorForm from "../components/nucleus/AssignSupervisorForm";

import type { Nucleus } from "../types/nucleus/Nucleus";

export default function NucleiPage() {
  const [createdNucleus, setCreatedNucleus] =
    useState<Nucleus | null>(null);

  const [updateSuccess, setUpdateSuccess] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  function handleCreated(nucleus: Nucleus) {
    setCreatedNucleus(nucleus);
    setUpdateSuccess(false);
    setRefreshKey(current => current + 1);
  }

  function handleUpdated() {
    setCreatedNucleus(null);
    setUpdateSuccess(true);
    setRefreshKey(current => current + 1);
  }

  return (
    <div className="nuclei-page">
      <div className="dashboard-heading">
        <h1>Gestão de Núcleos</h1>
        <p>
          Registo e administração dos Núcleos do SGN.
        </p>
      </div>

      {createdNucleus && (
        <div className="user-created-success" role="status">
          <CheckCircle2 size={22} />

          <div>
            <strong>Núcleo criado com sucesso!</strong>

            <p>
              {createdNucleus.name} ({createdNucleus.code})
            </p>
          </div>
        </div>
      )}

      {updateSuccess && (
        <div className="nucleus-update-success" role="status">
          <CheckCircle2 size={21} />

          <strong>
            Núcleo actualizado com sucesso!
          </strong>

          <button
            type="button"
            className="nucleus-update-success-close"
            onClick={() => setUpdateSuccess(false)}
            aria-label="Fechar notificação"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <NucleiTable
        refreshKey={refreshKey}
        onNucleusUpdated={handleUpdated}
      />

      <CreateNucleusForm onCreated={handleCreated} />

      <AssignSupervisorForm />
    </div>
  );
}
