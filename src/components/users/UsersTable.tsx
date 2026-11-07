import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UsersRound,
  Pencil,
  UserX,
  UserCheck,
  KeyRound
} from "lucide-react";

import { userService } from "../../services/userService";
import type { UserResponse } from "../../types/user/UserResponse";
import type { PageResponse } from "../../types/user/PageResponse";

interface UsersTableProps {
  refreshKey: number;
  onEdit: (user: UserResponse) => void;
  onDeactivate: (user: UserResponse) => void;
  onActivate: (user: UserResponse) => void;
  onResetPassword: (user: UserResponse) => void;
}

const PAGE_SIZE = 10;

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  SUPERVISOR_NUCLEO: "Supervisor de Núcleo",
  RESPONSAVEL_ORGAO_BASE: "Responsável do Órgão de Base",
};
export default function UsersTable({
  refreshKey,
  onEdit,
  onDeactivate,
  onActivate,
  onResetPassword,
}: UsersTableProps) {
  const [page, setPage] = useState(0);
  const [usersPage, setUsersPage] = useState<PageResponse<UserResponse> | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setIsLoading(true);
      setError("");

      try {
        const data = await userService.listUsers(page, PAGE_SIZE);

        if (!cancelled) {
          setUsersPage(data);
        }
      } catch (err) {
        if (!cancelled) {
          setUsersPage(null);
          setError(
            err instanceof Error
              ? err.message
              : "Erro ao carregar utilizadores.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [page, refreshKey, reloadKey]);

  const users = usersPage?.content ?? [];
  const totalElements = usersPage?.totalElements ?? 0;
  const totalPages = usersPage?.totalPages ?? 0;

  function reload() {
    setReloadKey((current) => current + 1);
  }

  function previousPage() {
    setPage((current) => Math.max(0, current - 1));
  }

  function nextPage() {
    if (usersPage && !usersPage.last) {
      setPage((current) => current + 1);
    }
  }

  return (
    <section className="dashboard-panel users-table-panel">
      <div className="users-table-header">
        <div>
          <h2>Utilizadores registados</h2>
          <p>
            {usersPage
              ? `${totalElements} utilizador(es) encontrado(s)`
              : "Consulta de contas do sistema"}
          </p>
        </div>

        <button
          type="button"
          className="users-refresh-button"
          onClick={reload}
          disabled={isLoading}
          title="Actualizar lista"
          aria-label="Actualizar lista de utilizadores"
        >
          <RefreshCw size={17} />
          <span>Actualizar</span>
        </button>
      </div>

      {error && (
        <div className="users-table-error" role="alert">
          <p>{error}</p>

          <button type="button" onClick={reload}>
            Tentar novamente
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="users-table-message" role="status">
          A carregar utilizadores...
        </div>
      ) : !error && users.length === 0 ? (
        <div className="users-table-empty">
          <UsersRound size={32} />

          <strong>Nenhum utilizador encontrado</strong>

          <p>Ainda não existem utilizadores nesta página.</p>
        </div>
      ) : !error ? (
        <>
          <div className="users-table-scroll">
            <table className="users-table">
              <thead>
                <tr>
                  <th scope="col">Nome</th>
                  <th scope="col">Username</th>
                  <th scope="col">Perfil</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acções</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id ?? `${page}-${index}`}>
                    <td>
                      <strong>{user.name}</strong>
                    </td>

                    <td>{user.username}</td>

                    <td>
                      <span className="users-role">
                        {ROLE_LABELS[user.role] ?? user.role}
                      </span>
                    </td>

                    <td>
                      {typeof user.active === "boolean" ? (
                        <span
                          className={`users-status ${
                            user.active
                              ? "users-status-active"
                              : "users-status-inactive"
                          }`}
                        >
                          {user.active ? "Activo" : "Inactivo"}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>
                      <div className="users-row-actions">
                        <button
                          type="button"
                          className="users-edit-button"
                          onClick={() => onEdit(user)}
                          aria-label={`Editar ${user.name}`}
                        >
                          <Pencil size={16} />
                          <span>Editar</span>
                        </button>

                        {user.active ? (
                          <button
                            type="button"
                            className="users-deactivate-button"
                            onClick={() => onDeactivate(user)}
                            aria-label={`Desactivar ${user.name}`}
                          >
                            <UserX size={16} />
                            <span>Desactivar</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="users-activate-button"
                            onClick={() => onActivate(user)}
                            aria-label={`Activar ${user.name}`}
                          >
                            <UserCheck size={16} />
                            <span>Activar</span>
                          </button>
                        )}

                        <button
                          type="button"
                          className="users-reset-password-button"
                          onClick={() => onResetPassword(user)}
                          aria-label={`Repor palavra-passe de ${user.name}`}
                          title={`Repor palavra-passe de ${user.name}`}
                        >
                          <KeyRound size={16} />
                          <span>Repor senha</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="users-pagination">
            <span>
              Página {page + 1} de {Math.max(1, totalPages)}
            </span>

            <div className="users-pagination-actions">
              <button
                type="button"
                onClick={previousPage}
                disabled={page === 0 || isLoading}
              >
                <ChevronLeft size={17} />
                Anterior
              </button>

              <button
                type="button"
                onClick={nextPage}
                disabled={isLoading || !usersPage || usersPage.last}
              >
                Próxima
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
