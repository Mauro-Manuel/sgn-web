
import { useState, type FormEvent } from "react";
import { Save, UserPlus } from "lucide-react";

import { userService } from "../../services/userService";

import type { UserRole } from "../../types/user/UserRole";
import type { UserResponse } from "../../types/user/UserResponse";

interface CreateUserFormProps {
    onCreated: (user: UserResponse) => void;
}

export default function CreateUserForm({
    onCreated
}: CreateUserFormProps) {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] =
        useState<UserRole>("SUPERVISOR_NUCLEO");

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
        setIsLoading(true);

        try {
            const user = await userService.createUser({
                name: name.trim(),
                username: username.trim(),
                password,
                role
            });

            setName("");
            setUsername("");
            setPassword("");
            setRole("SUPERVISOR_NUCLEO");

            onCreated(user);

        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Erro inesperado ao criar utilizador."
            );

        } finally {
            setIsLoading(false);
        }
    }

    return (
        <section className="dashboard-panel">
            <div className="user-form-heading">
                <UserPlus size={22} />

                <div>
                    <h2>Criar utilizador</h2>
                    <p>
                        Apenas o Administrador pode criar contas.
                    </p>
                </div>
            </div>

            <form
                className="create-user-form"
                onSubmit={handleSubmit}
            >
                <div className="field-group">
                    <label htmlFor="user-name">
                        Nome completo
                    </label>

                    <input
                        id="user-name"
                        type="text"
                        value={name}
                        onChange={event =>
                            setName(event.target.value)
                        }
                        placeholder="Nome completo do utilizador"
                        autoComplete="name"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className="field-group">
                    <label htmlFor="new-username">
                        Nome de utilizador
                    </label>

                    <input
                        id="new-username"
                        type="text"
                        value={username}
                        onChange={event =>
                            setUsername(event.target.value)
                        }
                        placeholder="Ex.: joao.manuel"
                        autoComplete="off"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className="field-group">
                    <label htmlFor="new-user-role">
                        Perfil
                    </label>

                    <select
                        id="new-user-role"
                        value={role}
                        onChange={event =>
                            setRole(event.target.value as UserRole)
                        }
                        required
                        disabled={isLoading}
                    >
                        <option value="ADMIN">
                            Administrador
                        </option>

                        <option value="SUPERVISOR_NUCLEO">
                            Supervisor de Núcleo
                        </option>

                        <option value="RESPONSAVEL_ORGAO_BASE">
                            Responsável do Órgão de Base
                        </option>
                    </select>
                </div>

                <div className="field-group">
                    <label htmlFor="temporary-password">
                        Palavra-passe temporária
                    </label>

                    <input
                        id="temporary-password"
                        type="password"
                        value={password}
                        onChange={event =>
                            setPassword(event.target.value)
                        }
                        placeholder="Definir palavra-passe temporária"
                        autoComplete="new-password"
                        required
                        disabled={isLoading}
                    />
                </div>

                <p className="user-form-help">
                    O utilizador terá de alterar a palavra-passe
                    no primeiro acesso ao SGN.
                </p>

                {error && (
                    <p className="change-password-error" role="alert">
                        {error}
                    </p>
                )}

                <button
                    className="submit-button"
                    type="submit"
                    disabled={isLoading}
                >
                    <Save size={17} />

                    {isLoading
                        ? "A criar utilizador..."
                        : "Criar utilizador"}
                </button>
            </form>
        </section>
    );
}
