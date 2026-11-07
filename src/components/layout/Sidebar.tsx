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

const menuItems = [
  { label: "Dashboard", Icon: LayoutDashboard },
  { label: "Militantes", Icon: UsersRound },
  { label: "Admissões", Icon: ClipboardList },
  { label: "Transferências", Icon: ArrowLeftRight },
  { label: "Núcleos", Icon: Network },
  { label: "Utilizadores", Icon: UserCog },
  { label: "Relatórios", Icon: FileBarChart },
  { label: "Configurações", Icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}

export default function Sidebar({
  open,
  onClose,
  onLogout,
  isLoggingOut,
}: SidebarProps) {
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
          {menuItems.map(({ label, Icon }, index) => (
            <button
              type="button"
              key={label}
              className={`sidebar-link ${index === 0 ? "active" : ""}`}
              disabled={index !== 0}
              aria-current={index === 0 ? "page" : undefined}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
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
