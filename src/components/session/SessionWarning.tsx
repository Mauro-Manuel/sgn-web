
import { Clock3, ShieldAlert } from "lucide-react";

interface SessionWarningProps {
    isLoading: boolean;
    onContinue: () => void;
}

export default function SessionWarning({
    isLoading,
    onContinue
}: SessionWarningProps) {
    return (
        <div className="session-warning-overlay">
            <section
                className="session-warning-modal"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="session-warning-title"
                aria-describedby="session-warning-description"
            >
                <div className="session-warning-icon">
                    <ShieldAlert size={30} />
                </div>

                <h2 id="session-warning-title">
                    A tua sessão está prestes a expirar
                </h2>

                <p id="session-warning-description">
                    Detectámos um período de inactividade.
                    A tua sessão poderá expirar dentro de
                    aproximadamente 2 minutos.
                </p>

                <div className="session-warning-time">
                    <Clock3 size={17} />
                    <span>Limite de inactividade: 15 minutos</span>
                </div>

                <button
                    type="button"
                    className="submit-button"
                    onClick={onContinue}
                    disabled={isLoading}
                    autoFocus
                >
                    {isLoading
                        ? "A verificar sessão..."
                        : "Continuar sessão"}
                </button>
            </section>
        </div>
    );
}
