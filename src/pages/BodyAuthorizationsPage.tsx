
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";

import CreateBodyAuthorizationForm from "../components/bodyAuthorizations/CreateBodyAuthorizationForm";

import { bodyAuthorizationService } from "../services/bodyAuthorizationService";
import { competentBodyService } from "../services/competentBodyService";
import { userService } from "../services/userService";

import type { CompetentBody } from "../types/competentBody/CompetentBody";
import type { BodyAuthorization } from "../types/bodyAuthorization/BodyAuthorization";

import type { AuthorizationUserOption } from "../components/bodyAuthorizations/CreateBodyAuthorizationForm";

export default function BodyAuthorizationsPage() {
  const [users, setUsers] = useState<AuthorizationUserOption[]>([]);
  const [competentBodies, setCompetentBodies] =
    useState<CompetentBody[]>([]);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [authorizations, setAuthorizations] =
    useState<BodyAuthorization[]>([]);

  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoadingAuthorizations, setIsLoadingAuthorizations] =
    useState(false);

  const [optionsError, setOptionsError] = useState("");
  const [listError, setListError] = useState("");
  const [success, setSuccess] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      setIsLoadingOptions(true);
      setOptionsError("");

      try {
        const allUsers: AuthorizationUserOption[] = [];
        const allBodies: CompetentBody[] = [];

        let userPage = 0;
        let userPages = 1;

        do {
          const result = await userService.listUsers(
            userPage,
            50
          );

          if (!active) return;

          allUsers.push(
            ...result.content
              .filter(
                user =>
                  user.role === "RESPONSAVEL_ORGAO_BASE" &&
                  user.active
              )
              .map(user => ({
                id: user.id,
                fullName: user.name,
                username: user.username,
              }))
          );

          userPages = result.totalPages;
          userPage++;
        } while (userPage < userPages);

        let bodyPage = 0;
        let bodyPages = 1;

        do {
          const result =
            await competentBodyService.listCompetentBodies(
              bodyPage,
              50
            );

          if (!active) return;

          allBodies.push(...result.content);

          bodyPages = result.totalPages;
          bodyPage++;
        } while (bodyPage < bodyPages);

        if (!active) return;

        setUsers(allUsers);
        setCompetentBodies(allBodies);
      } catch (err) {
        if (active) {
          setOptionsError(
            err instanceof Error
              ? err.message
              : "Erro ao carregar utilizadores e órgãos competentes."
          );
        }
      } finally {
        if (active) {
          setIsLoadingOptions(false);
        }
      }
    }

    void loadOptions();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    if (!selectedUserId) {
      setAuthorizations([]);
      setListError("");
      setIsLoadingAuthorizations(false);

      return () => controller.abort();
    }

    async function loadAuthorizations() {
      setIsLoadingAuthorizations(true);
      setListError("");

      try {
        const result =
          await bodyAuthorizationService.listBodyAuthorizations(
            selectedUserId,
            controller.signal
          );

        if (!controller.signal.aborted) {
          setAuthorizations(result);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        setAuthorizations([]);
        setListError(
          err instanceof Error
            ? err.message
            : "Erro ao consultar autorizações."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingAuthorizations(false);
        }
      }
    }

    void loadAuthorizations();

    return () => controller.abort();
  }, [selectedUserId, refreshKey]);

  const userNames = useMemo(
    () => new Map(users.map(user => [user.id, user.fullName])),
    [users]
  );

  const bodyNames = useMemo(
    () =>
      new Map(
        competentBodies.map(body => [
          body.id,
          `${body.name} (${body.code})`,
        ])
      ),
    [competentBodies]
  );

  function handleCreated(userId: string) {
    setSuccess(true);

    if (selectedUserId !== userId) {
      setSelectedUserId(userId);
    } else {
      setRefreshKey(current => current + 1);
    }
  }

  return (
    <div className="body-authorizations-page">
      <div className="dashboard-heading">
        <h1>Gestão de Autorizações</h1>
        <p>
          Atribuição e consulta de autorizações dos
          responsáveis dos Órgãos Competentes.
        </p>
      </div>

      {success && (
        <div
          className="body-authorization-success"
          role="status"
        >
          <CheckCircle2 size={21} />

          <strong>
            Autorização criada com sucesso!
          </strong>

          <button
            type="button"
            onClick={() => setSuccess(false)}
            aria-label="Fechar notificação"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* TABELA EM CIMA */}

      <section className="body-authorization-card">
        <div className="body-authorization-list-header">
          <div>
            <h3>Autorizações registadas</h3>
            <p>
              Consulta as autorizações atribuídas
              a cada responsável.
            </p>
          </div>

          <button
            type="button"
            className="users-refresh-button"
            onClick={() =>
              setRefreshKey(current => current + 1)
            }
            disabled={
              isLoadingAuthorizations || !selectedUserId
            }
          >
            <RefreshCw size={17} />
            Actualizar
          </button>
        </div>

        <div className="body-authorization-filter">
          <label htmlFor="filter-authorization-user">
            Filtrar por utilizador
          </label>

          <select
            id="filter-authorization-user"
            value={selectedUserId}
            onChange={event =>
              setSelectedUserId(event.target.value)
            }
            disabled={isLoadingOptions}
          >
            <option value="">
              Seleccionar utilizador
            </option>

            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.fullName} ({user.username})
              </option>
            ))}
          </select>
        </div>

        {optionsError && (
          <p
            className="change-password-error"
            role="alert"
          >
            {optionsError}
          </p>
        )}

        {listError && (
          <p
            className="change-password-error"
            role="alert"
          >
            {listError}
          </p>
        )}

        {!selectedUserId ? (
          <div className="users-table-empty">
            <ShieldCheck size={30} />
            <p>
              Selecciona um utilizador para consultar
              as suas autorizações.
            </p>
          </div>
        ) : isLoadingAuthorizations ? (
          <div className="users-table-message">
            A carregar autorizações...
          </div>
        ) : !listError && authorizations.length === 0 ? (
          <div className="users-table-empty">
            <ShieldCheck size={30} />
            <strong>Nenhuma autorização encontrada</strong>
            <p>
              Este utilizador não possui autorizações
              registadas.
            </p>
          </div>
        ) : !listError ? (
          <div className="body-authorization-table-scroll">
            <table className="body-authorization-table">
              <thead>
                <tr>
                  <th>Utilizador</th>
                  <th>Órgão Competente</th>
                  <th>Válido desde</th>
                  <th>Válido até</th>
                </tr>
              </thead>

              <tbody>
                {authorizations.map((authorization, index) => (
                  <tr
                    key={
                      authorization.id ??
                      `${authorization.competentBodyId}-${index}`
                    }
                  >
                    <td>
                      {userNames.get(authorization.userId) ??
                        "Utilizador indisponível"}
                    </td>

                    <td>
                      {bodyNames.get(
                        authorization.competentBodyId
                      ) ?? "Órgão indisponível"}
                    </td>

                    <td>{authorization.validFrom}</td>

                    <td>
                      {authorization.validUntil ??
                        "Sem data de fim"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {/* FORMULÁRIO EM BAIXO */}

      {isLoadingOptions ? (
        <section className="body-authorization-card">
          A carregar utilizadores e Órgãos Competentes...
        </section>
      ) : (
        <CreateBodyAuthorizationForm
          users={users}
          competentBodies={competentBodies}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
