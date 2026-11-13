import {
  LayoutDashboard,
  UsersRound,
  ClipboardList,
  Network,
  Building2,
  UserCog,
  Settings,
  LogOut,
  ShieldCheck,
  ScrollText,
  ArrowLeftRight,
} from "lucide-react";

export type AppPage =
  | "dashboard"
  | "militants"
  | "admissions"
  | "users"
  | "settings"
  | "nuclei"
  | "competent-bodies"
  | "body-authorizations"
  | "audit"
  | "transfers"
  | "transfer-routing";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
  role: string;
  activePage: AppPage;
  permissions: string[];
  onNavigate: (page: AppPage) => void;
}

interface MenuItem {
  id: AppPage;
  label: string;
  Icon: typeof LayoutDashboard;
  enabled: boolean;
}

export default function Sidebar({
  open,
  onClose,
  onLogout,
  isLoggingOut,
  role,
  activePage,
  permissions,
  onNavigate,
}: SidebarProps) {
  const isAdmin = role === "ADMIN";
  const isSupervisor = role === "SUPERVISOR_NUCLEO";
  const isResponsible = role === "RESPONSAVEL_ORGAO_BASE";
  const canReadAudit = role === "ADMIN" && permissions.includes("AUDIT_READ");

  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      Icon: LayoutDashboard,
      enabled: true,
    },
    {
      id: "militants",
      label: "Militantes",
      Icon: UsersRound,
      enabled: isSupervisor,
    },
    {
      id: "transfers",
      label: "Transferências",
      Icon: ArrowLeftRight,
      enabled: role === "SUPERVISOR_NUCLEO",
    },
    {
      id: "admissions",
      label: "Pedidos para Decisão",
      Icon: ClipboardList,
      enabled: isResponsible,
    },
    {
      id: "nuclei",
      label: "Núcleos",
      Icon: Network,
      enabled: isAdmin,
    },
    {
      id: "competent-bodies",
      label: "Órgãos Competentes",
      Icon: Building2,
      enabled: isAdmin,
    },
    {
      id: "body-authorizations",
      label: "Autorizações",
      Icon: ShieldCheck,
      enabled: isAdmin,
    },
    {
      id: "audit",
      label: "Auditoria",
      Icon: ScrollText,
      enabled: canReadAudit,
    },
    {
      id: "users",
      label: "Utilizadores",
      Icon: UserCog,
      enabled: isAdmin,
    },
    {
      id: "transfer-routing",
      label: "Encaminhamento",
      Icon: Network,
      enabled: isAdmin,
    },
    {
      id: "settings",
      label: "Configurações",
      Icon: Settings,
      enabled: isAdmin,
    },
  ];

  // Apresentar apenas os menus autorizados.
  const visibleMenuItems = menuItems.filter((item) => item.enabled);

  function handleNavigate(page: AppPage) {
    onNavigate(page);
    onClose();
  }

  return (
    <>
      {open && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={onClose}
          aria-label="Fechar menu"
        />
      )}

      <aside className={`sgn-sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-flag">
            <span className="sidebar-brand-rooster" aria-hidden="true">
              🐓
            </span>
          </div>

          <div>
            <strong>SGN</strong>
            <small>Sistema de Gestão de Núcleos</small>
          </div>
        </div>

        <nav className="sidebar-navigation" aria-label="Menu principal">
          {visibleMenuItems.map(({ id, label, Icon }) => {
            const isActive = id === activePage;

            return (
              <button
                type="button"
                key={id}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                aria-current={isActive ? "page" : undefined}
                onClick={() => handleNavigate(id)}
              >
                <Icon size={19} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="sidebar-logout-button"
            onClick={onLogout}
            disabled={isLoggingOut}
          >
            <LogOut size={18} />

            <span>
              {isLoggingOut ? "A terminar sessão..." : "Terminar sessão"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
