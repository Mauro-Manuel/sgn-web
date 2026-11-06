import { useState, type FormEvent } from "react";

import {
  Eye,
  EyeOff,
  UsersRound,
  Network,
  ShieldCheck,
  HeartHandshake,
  LockKeyhole,
  //CheckCircle2,
} from "lucide-react";

import { authService } from "./services/authService";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import PasswordChangedPage from "./pages/PasswordChangedPage";


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
  // ESTADOS DO FORMULÁRIO
  // ========================================

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordChangeRequired, setPasswordChangeRequired] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);

  // ========================================
  // AUTENTICAÇÃO
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
        setPasswordChangeRequired(true);
        return;
      }

      setMessage(
        `Autenticação realizada com sucesso. Perfil: ${response.role}`,
      );

      // Futuramente:
      // navegar para /dashboard
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ocorreu um erro inesperado.";

      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // ========================================
  // INTERFACE
  // ========================================


if (passwordChanged) {
    return (
        <PasswordChangedPage
            onContinue={() => {
                setPasswordChanged(false);
                setPasswordChangeRequired(false);
                setMessage(
                    "Palavra-passe alterada com sucesso."
                );
            }}
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
