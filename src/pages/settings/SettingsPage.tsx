import { useState } from "react";
import { MapPinned, Network } from "lucide-react";

import TerritorialUnitsPage from "./TerritorialUnitsPage";
import OrganizationalUnitsPage from "./OrganizationalUnitsPage";

type SettingsTab = "territorial" | "organizational";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("territorial");

  return (
    <div className="settings-page">
      <div className="dashboard-heading">
        <h1>Configurações</h1>
        <p>Gestão das estruturas territoriais e organizacionais do SGN.</p>
      </div>

      <div
        className="settings-tabs"
        role="tablist"
        aria-label="Secções de configurações"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "territorial"}
          className={activeTab === "territorial" ? "active" : ""}
          onClick={() => setActiveTab("territorial")}
        >
          <MapPinned size={18} />
          Unidades Territoriais
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "organizational"}
          className={activeTab === "organizational" ? "active" : ""}
          onClick={() => setActiveTab("organizational")}
        >
          <Network size={18} />
          Unidades Organizacionais
        </button>
      </div>

      <section className="dashboard-panel">
        {activeTab === "territorial" ? (
          <TerritorialUnitsPage />
        ) : (
          <OrganizationalUnitsPage />
        )}
      </section>
    </div>
  );
}
