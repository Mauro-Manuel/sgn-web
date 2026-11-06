
import { useState, type FormEvent } from "react";
import {
    Eye,
    EyeOff,
    LockKeyhole,
    ShieldCheck,
    CheckCircle2
} from "lucide-react";

import { authService } from "../services/authService";

interface ChangePasswordPageProps {
    onPasswordChanged: () => void;
}

export default function ChangePasswordPage({
    onPasswordChanged
}: ChangePasswordPageProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPasswords, setShowPasswords] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (isLoading) {
            return;
        }

        setError("");

        if (newPassword !== confirmPassword) {
            setError(
                "A nova palavra-passe e a confirmação não coincidem."
            );
            return;
        }

        if (currentPassword === newPassword) {
            setError(
                "A nova palavra-passe deve ser diferente da actual."
            );
            return;
        }

        setIsLoading(true);

        try {
            await authService.changePassword({
                currentPassword,
                newPassword
            });

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            onPasswordChanged();

        } catch (error) {
            const message = error instanceof Error
                ? error.message
                : "Ocorreu um erro inesperado.";

            setError(message);

        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main className="change-password-page">

            <section className="change-password-card">

                <div className="change-password-icon">
                    <ShieldCheck size={36} />
                </div>

                <div className="change-password-header">
                    <span className="change-password-kicker">
                        SGN · Segurança da conta
                    </span>

                    <h1>Alterar palavra-passe</h1>

                    <p>
                        Por motivos de segurança, é obrigatório
                        alterar a palavra-passe temporária
                        antes de aceder ao sistema.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>

                    <div className="field-group">
                        <label htmlFor="currentPassword">
                            Palavra-passe actual
                        </label>

                        <input
                            id="currentPassword"
                            type={showPasswords ? "text" : "password"}
                            value={currentPassword}
                            onChange={(event) =>
                                setCurrentPassword(event.target.value)
                            }
                            placeholder="Digite a palavra-passe actual"
                            autoComplete="current-password"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="newPassword">
                            Nova palavra-passe
                        </label>

                        <input
                            id="newPassword"
                            type={showPasswords ? "text" : "password"}
                            value={newPassword}
                            onChange={(event) =>
                                setNewPassword(event.target.value)
                            }
                            placeholder="Digite a nova palavra-passe"
                            autoComplete="new-password"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="confirmPassword">
                            Confirmar nova palavra-passe
                        </label>

                        <input
                            id="confirmPassword"
                            type={showPasswords ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            placeholder="Confirme a nova palavra-passe"
                            autoComplete="new-password"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <label className="change-password-toggle">
                        <input
                            type="checkbox"
                            checked={showPasswords}
                            onChange={(event) =>
                                setShowPasswords(event.target.checked)
                            }
                        />

                        {showPasswords
                            ? <EyeOff size={17} />
                            : <Eye size={17} />}

                        Mostrar palavras-passe
                    </label>

                    {error && (
                        <p
                            className="change-password-error"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isLoading}
                    >
                        <LockKeyhole size={17} />

                        {isLoading
                            ? "A alterar..."
                            : "Alterar palavra-passe"}
                    </button>

                </form>

                <div className="change-password-footer">
                    <CheckCircle2 size={17} />

                    <span>
                        A alteração protege o acesso à tua conta.
                    </span>
                </div>

            </section>

        </main>
    );
}
