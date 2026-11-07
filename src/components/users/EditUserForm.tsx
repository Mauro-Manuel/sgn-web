
import { useState, type FormEvent } from "react";
import { Save, X } from "lucide-react";

import { userService } from "../../services/userService";
import type { UserResponse } from "../../types/user/UserResponse";
import type { UserRole } from "../../types/user/UserRole";

interface EditUserFormProps {
  user: UserResponse;
  onCancel: () => void;
  onUpdated: () => void;
}

export default function EditUserForm({
  user,
  onCancel,
  onUpdated,
}: EditUserFormProps) {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [role, setRole] = useState<UserRole>(user.role);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    const trimmedName = name.trim();
    const trimmedUsername = username.trim();

    if (!trimmedName || !trimmedUsername) {
      setError("Preenche os campos obrigatórios.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      await userService.updateUser(user.id, {
        name: trimmedName,
        username: trimmedUsername,
        role,
      });

      onUpdated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro inesperado ao actualizar utilizador."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section
      className="dashboard-panel edit-user-panel"
      aria-labelledby="edit-user-title"
    >
      <div className="edit-user-heading">
        <div>
          <h2 id="edit-user-title">Editar utilizador</h2>
          <p>
            Actualizar os dados de {user.name}
          </p>
        </div>

        <button
          type="button"
          className="edit-user-close"
          onClick={onCancel}
          disabled={isSaving}
          aria-label="Cancelar edição"
        >
          <X size={20} />
        </button>
      </div>

      <form
        className="create-user-form"
        onSubmit={handleSubmit}
      >
        <div className="field-group">
          <label htmlFor="edit-user-name">
            Nome completo
          </label>

          <input
            id="edit-user-name"
            type="text"
            value={name}
            onChange={event =>
              setName(event.target.value)
            }
            required
            disabled={isSaving}
          />
        </div>

        <div className="field-group">
          <label htmlFor="edit-user-username">
            Nome de utilizador
          </label>

          <input
            id="edit-user-username"
            type="text"
            value={username}
            onChange={event =>
              setUsername(event.target.value)
            }
            required
            disabled={isSaving}
          />
        </div>

        <div className="field-group">
          <label htmlFor="edit-user-role">
            Perfil
          </label>

          <select
            id="edit-user-role"
            value={role}
            onChange={event =>
              setRole(event.target.value as UserRole)
            }
            required
            disabled={isSaving}
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

        {error && (
          <p
            className="change-password-error"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="edit-user-actions">
          <button
            type="button"
            className="edit-user-cancel"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="submit-button"
            disabled={isSaving}
          >
            <Save size={17} />
            {isSaving
              ? "A guardar..."
              : "Guardar alterações"}
          </button>
        </div>
      </form>
    </section>
  );
}
