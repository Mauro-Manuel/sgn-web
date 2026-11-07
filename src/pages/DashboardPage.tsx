import {
  UsersRound,
  ClipboardList,
  ArrowLeftRight,
  Network,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";
import StatsCard from "../components/dashboard/StatsCard";

interface DashboardPageProps {
  name: string;
  role: string;
  onLogout: () => void;
  isLoggingOut: boolean;
}

export default function DashboardPage({
  name,
  role,
  onLogout,
  isLoggingOut,
}: DashboardPageProps) {
  return (
    <AppLayout
      name={name}
      role={role}
      onLogout={onLogout}
      isLoggingOut={isLoggingOut}
    >
      <div className="dashboard-heading">
        <h1>Dashboard</h1>
        <p>Visão geral do Sistema de Gestão de Núcleos</p>
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
          <p>O gráfico será apresentado após a integração com a API.</p>
        </section>

        <section className="dashboard-panel">
          <h2>Militantes por Província</h2>
          <p>
            Os dados serão apresentados conforme o âmbito de acesso do
            utilizador.
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
    </AppLayout>
  );
}
