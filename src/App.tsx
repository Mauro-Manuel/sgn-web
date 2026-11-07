import { useEffect, useState, type FormEvent } from "react";

import {
  Eye,
  EyeOff,
  UsersRound,
  Network,
  ShieldCheck,
  HeartHandshake,
  LockKeyhole,
} from "lucide-react";

import { authService } from "./services/authService";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import PasswordChangedPage from "./pages/PasswordChangedPage";
import DashboardPage from "./pages/DashboardPage";
import type { AuthenticatedUserResponse } from "./types/AuthenticatedUserResponse";

const highlights = [
  { label: "Militantes", Icon: UsersRound },
  { label: "Núcleos", Icon: Network },
  { label: "Estrutura organizada", Icon: HeartHandshake },
  { label: "Gestão eficiente", Icon: ShieldCheck },
];

function PartyMark() {
  return (
    <div
      className="party-mark"
      aria-label="Identidade visual da UNITA (símbolo provisório)"
    >
      <div className="party-flag">
        <span className="party-rooster" aria-hidden="true">
          🐓
        </span>
      </div>

      <span className="party-name">UNITA</span>
    </div>
  );
}

export default function App() {
  // ========================================
  // ESTADOS
  // ========================================

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [passwordChangeRequired, setPasswordChangeRequired] = useState(false);

  const [passwordChanged, setPasswordChanged] = useState(false);

  const [authenticatedUser, setAuthenticatedUser] =
    useState<AuthenticatedUserResponse | null>(null);

  const [isValidatingSession, setIsValidatingSession] = useState(false);

  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ========================================
  // RECUPERAR SESSÃO APÓS REFRESH
  // ========================================

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const startTime = performance.now();
      const minimumLoadingTime = 1600;

      try {
        const user = await authService.getAuthenticatedUser();

        if (cancelled) {
          return;
        }

        if (user.passwordChangeRequired) {
          setAuthenticatedUser(null);
          setPasswordChangeRequired(true);
        } else {
          setPasswordChangeRequired(false);
          setAuthenticatedUser(user);
        }
      } catch {
        if (cancelled) {
          return;
        }

        setAuthenticatedUser(null);
        setPasswordChangeRequired(false);
      } finally {
        const elapsed = performance.now() - startTime;

        const remainingTime = Math.max(0, minimumLoadingTime - elapsed);

        await new Promise<void>((resolve) => {
          setTimeout(resolve, remainingTime);
        });

        if (!cancelled) {
          setIsCheckingSession(false);
        }
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // ========================================
  // LOGIN
  // ========================================

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setMessage("");
    setIsLoading(true);

    try {
      const response = await authService.login({
        username: username.trim(),
        password,
      });

      setPassword("");

      if (response.passwordChangeRequired) {
        setAuthenticatedUser(null);
        setPasswordChangeRequired(true);
        return;
      }

      const user = await authService.getAuthenticatedUser();

      if (user.passwordChangeRequired) {
        setAuthenticatedUser(null);
        setPasswordChangeRequired(true);
        return;
      }

      setPasswordChangeRequired(false);
      setPasswordChanged(false);
      setAuthenticatedUser(user);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ocorreu um erro inesperado.";

      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // ========================================
  // CONTINUAR APÓS ALTERAÇÃO DA PALAVRA-PASSE
  // ========================================

  async function handlePasswordChangedContinue() {
    if (isValidatingSession) {
      return;
    }

    setIsValidatingSession(true);
    setMessage("");

    try {
      const user = await authService.getAuthenticatedUser();

      if (user.passwordChangeRequired) {
        setPasswordChanged(false);
        setPasswordChangeRequired(true);
        setAuthenticatedUser(null);
        return;
      }

      setPasswordChanged(false);
      setPasswordChangeRequired(false);
      setAuthenticatedUser(user);
    } catch {
      setPasswordChanged(false);
      setPasswordChangeRequired(false);
      setAuthenticatedUser(null);

      setMessage(
        "Não foi possível confirmar a sessão. " + "Autentica-te novamente.",
      );
    } finally {
      setIsValidatingSession(false);
    }
  }

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setMessage("");

    try {
      await authService.logout();

      // Logout confirmado pelo backend.
      setAuthenticatedUser(null);
      setPasswordChangeRequired(false);
      setPasswordChanged(false);

      setUsername("");
      setPassword("");
      setRememberMe(false);

      setMessage("Sessão terminada com sucesso.");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Não foi possível terminar a sessão.";

      // Não simular um Logout quando a API falha.
      setMessage(errorMessage);
    } finally {
      setIsLoggingOut(false);
    }
  }

  // ========================================
  // CONTROLO DAS PÁGINAS
  // ========================================

  if (isCheckingSession) {
    return (
      <main className="session-loading" role="status" aria-live="polite">
        <div className="session-loading-spinner" />

        <h2>SGN</h2>

        <p>A verificar sessão...</p>
      </main>
    );
  }

  if (passwordChanged) {
    return (
      <PasswordChangedPage
        onContinue={() => {
          void handlePasswordChangedContinue();
        }}
        isLoading={isValidatingSession}
      />
    );
  }

  if (passwordChangeRequired) {
    return (
      <ChangePasswordPage
        onPasswordChanged={() => {
          setPasswordChangeRequired(false);
          setPasswordChanged(true);
        }}
      />
    );
  }

  if (authenticatedUser !== null) {
    return (
      <>
        {message && (
          <p className="dashboard-error" role="alert">
            {message}
          </p>
        )}

        <DashboardPage
          name={authenticatedUser.name}
          role={authenticatedUser.role}
          onLogout={() => {
            void handleLogout();
          }}
          isLoggingOut={isLoggingOut}
        />
      </>
    );
  }

  // ========================================
  // PÁGINA DE LOGIN
  // ========================================

  return (
    <main className="login-page">
      {/* PAINEL ESQUERDO */}

      <section className="hero-panel" aria-labelledby="hero-title">
        <div className="hero-flag" aria-hidden="true" />

        <div className="hero-shade" />

        <div className="hero-content">
          <div className="hero-kicker">UNITA · Sistema de Gestão</div>

          <h1 id="hero-title">SGN</h1>

          <h2>
            Sistema de Gestão
            <br />
            de Núcleos
          </h2>

          <p>Organização, unidade e participação para uma Angola melhor.</p>

          <ul className="hero-highlights">
            {highlights.map(({ label, Icon }) => (
              <li key={label}>
                <Icon size={19} aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PAINEL DIREITO */}

      <section className="form-panel" aria-labelledby="login-title">
        <div className="form-container">
          <PartyMark />

          <div className="form-header">
            <h2 id="login-title">SGN</h2>

            <p>Sistema de Gestão de Núcleos</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* UTILIZADOR */}

            <div className="field-group">
              <label htmlFor="username">Utilizador</label>

              <input
                id="username"
                name="username"
                type="text"
                placeholder="Digite o seu utilizador"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
                disabled={isLoading}
              />
            </div>

            {/* PALAVRA-PASSE */}

            <div className="field-group">
              <label htmlFor="password">Palavra-passe</label>

              <div className="password-field">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite a sua palavra-passe"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                />

                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword
                      ? "Ocultar palavra-passe"
                      : "Mostrar palavra-passe"
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* OPÇÕES */}

            <div className="form-options">
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                Manter sessão iniciada
              </label>

              <span
                className="help-text"
                title="A recuperação de acesso é realizada pelo Administrador"
              >
                Precisa de ajuda?
              </span>
            </div>

            {/* BOTÃO ENTRAR */}

            <button
              className="submit-button"
              type="submit"
              disabled={isLoading}
            >
              <LockKeyhole size={17} />

              {isLoading ? "A autenticar..." : "Entrar"}
            </button>

            {/* MENSAGEM */}

            {message && (
              <p className="form-message" role="status">
                {message}
              </p>
            )}
          </form>
        </div>

        {/* RODAPÉ */}

        <footer className="form-footer">
          <strong>UNITA</strong>

          <span>Por uma Angola livre, justa e próspera.</span>
        </footer>
      </section>
    </main>
  );
}
