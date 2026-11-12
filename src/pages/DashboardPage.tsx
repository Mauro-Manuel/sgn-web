
import { useState } from "react";

import {
  UsersRound,
  ClipboardList,
  ArrowLeftRight,
  Network,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import type { AppPage } from "../components/layout/Sidebar";

import StatsCard from "../components/dashboard/StatsCard";

import UsersPage from "./UsersPage";
import SettingsPage from "./settings/SettingsPage";
import NucleiPage from "./NucleiPage";
import MembersPage from "./MembersPage";
import AdmissionsPage from "./AdmissionsPage";
import CompetentBodiesPage from "./CompetentBodiesPage";
import BodyAuthorizationsPage from "./BodyAuthorizationsPage";
import AuditPage from "./AuditPage";

interface DashboardPageProps {
  name: string;
  role: string;
  permissions: string[];
  onLogout: () => void;
  isLoggingOut: boolean;
}

export default function DashboardPage({
  name,
  role,
  permissions,
  onLogout,
  isLoggingOut,
}: DashboardPageProps) {
  const [activePage, setActivePage] =
    useState<AppPage>("dashboard");

  const isAdmin = role === "ADMIN";
  const isSupervisor = role === "SUPERVISOR_NUCLEO";
  const isResponsible = role === "RESPONSAVEL_ORGAO_BASE";

  const canReadAudit =
    isAdmin && permissions.includes("AUDIT_READ");

  function canAccessPage(page: AppPage): boolean {
    switch (page) {
      case "dashboard":
        return true;

      case "militants":
        return isSupervisor;

      case "admissions":
        return isResponsible;

      case "users":
      case "settings":
      case "nuclei":
      case "competent-bodies":
      case "body-authorizations":
        return isAdmin;

      case "audit":
        return canReadAudit;

      default:
        return false;
    }
  }

  function handleNavigate(page: AppPage) {
    if (!canAccessPage(page)) {
      return;
    }

    setActivePage(page);
  }

  const currentPage = canAccessPage(activePage)
    ? activePage
    : "dashboard";

  return (
    <AppLayout
      name={name}
      role={role}
      permissions={permissions}
      onLogout={onLogout}
      isLoggingOut={isLoggingOut}
      activePage={currentPage}
      onNavigate={handleNavigate}
    >
      {currentPage === "users" ? (
        <UsersPage />
      ) : currentPage === "settings" ? (
        <SettingsPage />
      ) : currentPage === "nuclei" ? (
        <NucleiPage />
      ) : currentPage === "militants" ? (
        <MembersPage />
      ) : currentPage === "admissions" ? (
        <AdmissionsPage />
      ) : currentPage === "competent-bodies" ? (
        <CompetentBodiesPage />
      ) : currentPage === "body-authorizations" ? (
        <BodyAuthorizationsPage />
      ) : currentPage === "audit" ? (
        <AuditPage permissions={permissions}  />
      ) : (
        <>
          <div className="dashboard-heading">
            <h1>Dashboard</h1>
            <p>
              Visão geral do Sistema de Gestão de Núcleos
            </p>
          </div>

          <div className="dashboard-stats">
            <StatsCard
              title="Militantes"
              value="—"
              icon={<UsersRound size={27} />}
              variant="green"
            />

            <StatsCard
              title="Admissões pendentes"
              value="—"
              icon={<ClipboardList size={27} />}
              variant="red"
            />

            <StatsCard
              title="Transferências em curso"
              value="—"
              icon={<ArrowLeftRight size={27} />}
              variant="dark"
            />

            <StatsCard
              title="Núcleos activos"
              value="—"
              icon={<Network size={27} />}
              variant="green"
            />
          </div>

          <div className="dashboard-panels">
            <section className="dashboard-panel">
              <h2>Evolução de Militantes</h2>
              <p>
                O gráfico será apresentado após a integração
                com a API.
              </p>
            </section>

            <section className="dashboard-panel">
              <h2>Militantes por Província</h2>
              <p>
                Os dados serão apresentados conforme o âmbito
                de acesso do utilizador.
              </p>
            </section>
          </div>

          <div className="dashboard-panels">
            <section className="dashboard-panel">
              <h2>Admissões Recentes</h2>
              <p>Sem dados carregados.</p>
            </section>

            <section className="dashboard-panel">
              <h2>Transferências em Curso</h2>
              <p>Sem dados carregados.</p>
            </section>
          </div>
        </>
      )}
    </AppLayout>
  );
}
