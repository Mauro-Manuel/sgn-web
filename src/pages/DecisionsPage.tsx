
import { useState } from "react";
import { ClipboardCheck } from "lucide-react";

import AdmissionsPage from "./AdmissionsPage";

import PendingTransferDecisions from "../components/transfers/PendingTransferDecisions";

type DecisionTab = "admissions" | "transfers";

export default function DecisionsPage() {
  const [activeTab, setActiveTab] =
    useState<DecisionTab>("admissions");

  return (
    <div className="decisions-page">
      <div className="dashboard-heading">
        <h1>Pedidos para Decisão</h1>
        <p>
          Gestão de admissões e transferências
          submetidas aos órgãos competentes.
        </p>
      </div>

      <section className="decisions-card">
        <div className="decisions-card-header">
          <div>
            <h2>Pedidos para Decisão</h2>
            <p>Órgãos competentes · SGN</p>
          </div>

          <ClipboardCheck size={25} />
        </div>

        <div
          className="decisions-tabs"
          role="tablist"
          aria-label="Tipos de pedidos para decisão"
        >
          <button
            id="decision-tab-admissions"
            type="button"
            role="tab"
            aria-selected={activeTab === "admissions"}
            aria-controls="decision-panel-admissions"
            className={
              activeTab === "admissions"
                ? "decisions-tab active"
                : "decisions-tab"
            }
            onClick={() => setActiveTab("admissions")}
          >
            Admissões
          </button>

          <button
            id="decision-tab-transfers"
            type="button"
            role="tab"
            aria-selected={activeTab === "transfers"}
            aria-controls="decision-panel-transfers"
            className={
              activeTab === "transfers"
                ? "decisions-tab active"
                : "decisions-tab"
            }
            onClick={() => setActiveTab("transfers")}
          >
            Transferências
          </button>
        </div>

        <div
          id={
            activeTab === "admissions"
              ? "decision-panel-admissions"
              : "decision-panel-transfers"
          }
          role="tabpanel"
          aria-labelledby={
            activeTab === "admissions"
              ? "decision-tab-admissions"
              : "decision-tab-transfers"
          }
          className="decisions-tab-content"
        >
          {activeTab === "admissions" ? (
            <AdmissionsPage />
          ) : (
            <PendingTransferDecisions />
          )}
        </div>
      </section>
    </div>
  );
}
