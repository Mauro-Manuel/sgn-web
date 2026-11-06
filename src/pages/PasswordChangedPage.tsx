
import { CheckCircle2, ShieldCheck } from "lucide-react";

interface PasswordChangedPageProps {
    onContinue: () => void;
}

export default function PasswordChangedPage({
    onContinue
}: PasswordChangedPageProps) {
    return (
        <main className="change-password-page">
            <section className="change-password-card change-success">

                <div className="change-password-icon">
                    <CheckCircle2 size={38} />
                </div>

                <h1>Palavra-passe alterada com sucesso!</h1>

                <p>
                    A tua palavra-passe foi actualizada.
                    A tua conta está pronta para continuar.
                </p>

                <div className="change-password-footer">
                    <ShieldCheck size={17} />
                    <span>
                        SGN — Sistema de Gestão de Núcleos
                    </span>
                </div>

                <button
                    type="button"
                    className="submit-button"
                    onClick={onContinue}
                >
                    Continuar
                </button>

            </section>
        </main>
    );
}
