
import { useState, type ReactNode } from "react";
import { Bell, Menu, UserCircle2 } from "lucide-react";

import Sidebar from "./Sidebar";
import type { AppPage } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
  name: string;
  role: string;
  onLogout: () => void;
  isLoggingOut: boolean;
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export default function AppLayout({
  children,
  name,
  role,
  onLogout,
  isLoggingOut,
  activePage,
  onNavigate,
}: AppLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="sgn-app-layout">
      <Sidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onLogout={onLogout}
        isLoggingOut={isLoggingOut}
        role={role}
        activePage={activePage}
        onNavigate={onNavigate}
      />

      <div className="sgn-main-area">
        <header className="sgn-topbar">
          <button
            className="sgn-menu-button"
            type="button"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="sgn-topbar-right">
            <Bell
              size={19}
              aria-label="Notificações"
            />

            <div className="sgn-user">
              <UserCircle2 size={30} />

              <div>
                <strong>{name}</strong>
                <span>{role}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="sgn-dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}
