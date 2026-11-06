import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, UsersRound, Network, ShieldCheck, HeartHandshake, LockKeyhole } from 'lucide-react';

const highlights = [
  { label: 'Militantes', Icon: UsersRound },
  { label: 'Núcleos', Icon: Network },
  { label: 'Estrutura organizada', Icon: HeartHandshake },
  { label: 'Gestão eficiente', Icon: ShieldCheck },
];

function PartyMark() {
  return (
    <div className="party-mark" aria-label="Identidade visual da UNITA (símbolo provisório)">
      <div className="party-flag"><span className="party-rooster" aria-hidden="true">🐓</span></div>
      <span className="party-name">UNITA</span>
    </div>
  );
}

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('Interface pronta. A autenticação será activada quando integrarmos a API do SGN.');
  }

  return (
    <main className="login-page">
      <section className="hero-panel" aria-labelledby="hero-title">
        <div className="hero-flag" aria-hidden="true" />
        <div className="hero-shade" />
        <div className="hero-content">
          <div className="hero-kicker">UNITA · Sistema de Gestão</div>
          <h1 id="hero-title">SGN</h1>
          <h2>Sistema de Gestão<br />de Núcleos</h2>
          <p>Organização, unidade e participação para uma Angola melhor.</p>
          <ul className="hero-highlights">
            {highlights.map(({ label, Icon }) => (
              <li key={label}><Icon size={19} aria-hidden="true" />{label}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="form-panel" aria-labelledby="login-title">
        <div className="form-container">
          <PartyMark />
          <div className="form-header">
            <h2 id="login-title">SGN</h2>
            <p>Sistema de Gestão de Núcleos</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="username">Utilizador</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Digite o seu utilizador"
                value={username}
                onChange={event => setUsername(event.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="field-group">
              <label htmlFor="password">Palavra-passe</label>
              <div className="password-field">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite a sua palavra-passe"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword(value => !value)}
                  aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-options">
              <label className="check-label">
                <input type="checkbox" checked={rememberMe} onChange={event => setRememberMe(event.target.checked)} />
                Manter sessão iniciada
              </label>
              <span className="help-text" title="A recuperação de acesso é realizada pelo Administrador">Precisa de ajuda?</span>
            </div>
            <button className="submit-button" type="submit"><LockKeyhole size={17} /> Entrar</button>
            {message && <p className="form-message" role="status">{message}</p>}
          </form>
        </div>
        <footer className="form-footer"><strong>UNITA</strong><span>Por uma Angola livre, justa e próspera.</span></footer>
      </section>
    </main>
  );
}
