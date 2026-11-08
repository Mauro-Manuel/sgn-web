
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import CreateNucleusForm from "../components/nucleus/CreateNucleusForm";
import NucleiTable from "../components/nucleus/NucleiTable";

import type { Nucleus } from "../types/nucleus/Nucleus";

export default function NucleiPage() {
  const [createdNucleus, setCreatedNucleus] =
    useState<Nucleus | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  function handleCreated(nucleus: Nucleus) {
    setCreatedNucleus(nucleus);
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
            <strong>
              Núcleo criado com sucesso!
            </strong>

            <p>
              {createdNucleus.name} ({createdNucleus.code})
            </p>
          </div>
        </div>
      )}

      <NucleiTable refreshKey={refreshKey} />

      <CreateNucleusForm onCreated={handleCreated} />
    </div>
  );
}
