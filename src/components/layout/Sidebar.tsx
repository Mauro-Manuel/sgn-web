import {
  LayoutDashboard,
  UsersRound,
  ClipboardList,
  ArrowLeftRight,
  Network,
  UserCog,
  FileBarChart,
  Settings,
  LogOut,
} from "lucide-react";

export type AppPage = "dashboard" | "users" | "settings" | "nuclei";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
  role: string;
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export default function Sidebar({
  open,
  onClose,
  onLogout,
  isLoggingOut,
  role,
  activePage,
  onNavigate,
}: SidebarProps) {
  const isAdmin = role === "ADMIN";

  const menuItems = [
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
      enabled: false,
    },
    {
      id: "admissions",
      label: "Admissões",
      Icon: ClipboardList,
      enabled: false,
    },
    {
      id: "transfers",
      label: "Transferências",
      Icon: ArrowLeftRight,
      enabled: false,
    },
    {
      id: "nuclei",
      label: "Núcleos",
      Icon: Network,
      enabled: isAdmin,
    },
    {
      id: "users",
      label: "Utilizadores",
      Icon: UserCog,
      enabled: isAdmin,
    },
    {
      id: "reports",
      label: "Relatórios",
      Icon: FileBarChart,
      enabled: false,
    },
    {
      id: "settings",
      label: "Configurações",
      Icon: Settings,
      enabled: isAdmin,
    },
  ] as const;

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
          {menuItems.map(({ id, label, Icon, enabled }) => {
            const isActive = id === activePage;

            return (
              <button
                type="button"
                key={id}
                className={`sidebar-link ${isActive ? "active" : ""}`}
                disabled={!enabled}
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  if (
                    id === "dashboard" ||
                    id === "users" ||
                    id === "settings" ||
                    id === "nuclei"
                  ) {
                    handleNavigate(id);
                  }
                }}
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
