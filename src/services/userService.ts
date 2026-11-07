
import { authService } from "./authService";

import type { CreateUserRequest } from "../types/user/CreateUserRequest";
import type { UserResponse } from "../types/user/UserResponse";
import type { PageResponse } from "../types/user/PageResponse";
import type { UpdateUserRequest } from "../types/user/UpdateUserRequest";
import type { ResetPasswordResponse } from "../types/user/ResetPasswordResponse";

const API_BASE_URL = "/api/v1/users";

// ---------------------------------------------------------
// SESSION
// ---------------------------------------------------------

export class SessionExpiredError extends Error {
  constructor() {
    super("A sessão expirou. Autentica-te novamente.");
    this.name = "SessionExpiredError";
  }
}

function handleUnauthorized(): never {
  // Informar os componentes que a sessão deixou de ser válida.
  window.dispatchEvent(new Event("sgn:session-expired"));

  // Recarregar a aplicação no ecrã de login.
  // Evita manter o estado React anterior em memória.
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }

  throw new SessionExpiredError();
}

// ---------------------------------------------------------
// CSRF
// ---------------------------------------------------------

function getCookie(name: string): string | null {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(
    cookie.substring(name.length + 1)
  );
}

async function getCsrfHeaders(): Promise<Record<string, string>> {
  const csrf = await authService.getCsrfToken();

  const xsrfToken = getCookie("XSRF-TOKEN");

  if (!xsrfToken) {
    throw new Error(
      "Token CSRF indisponível. Actualiza a página."
    );
  }

  return {
    [csrf.headerName]: xsrfToken,
  };
}

// ---------------------------------------------------------
// HTTP ERRORS
// ---------------------------------------------------------

type ErrorMessages = {
  badRequest?: string;
  forbidden?: string;
  notFound?: string;
  conflict?: string;
  unprocessable?: string;
  generic: string;
};

function handleHttpError(
  response: Response,
  messages: ErrorMessages
): void {
  if (response.status === 401) {
    handleUnauthorized();
  }

  switch (response.status) {
    case 400:
      throw new Error(
        messages.badRequest ??
          "Dados inválidos. Verifica os campos preenchidos."
      );

    case 403:
      throw new Error(
        messages.forbidden ??
          "Não tens permissão para realizar esta operação."
      );

    case 404:
      throw new Error(
        messages.notFound ??
          "O recurso solicitado não foi encontrado."
      );

    case 409:
      throw new Error(
        messages.conflict ??
          "A operação não pode ser concluída devido a um conflito."
      );

    case 422:
      throw new Error(
        messages.unprocessable ??
          "Os dados não cumprem as regras de validação."
      );
  }

  if (!response.ok) {
    throw new Error(
      `${messages.generic} HTTP ${response.status}`
    );
  }
}

// ---------------------------------------------------------
// CREATE USER
// ---------------------------------------------------------

async function createUser(
  request: CreateUserRequest
): Promise<UserResponse> {
  const csrfHeaders = await getCsrfHeaders();

  const response = await fetch(API_BASE_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...csrfHeaders,
    },
    body: JSON.stringify(request),
    cache: "no-store",
  });

  handleHttpError(response, {
    badRequest: "Dados inválidos. Verifica os campos preenchidos.",
    forbidden: "Não tens permissão para criar utilizadores.",
    conflict: "Já existe um utilizador com este username.",
    unprocessable: "Verifica os dados do novo utilizador.",
    generic: "Erro ao criar utilizador.",
  });

  return response.json() as Promise<UserResponse>;
}

// ---------------------------------------------------------
// LIST USERS
// ---------------------------------------------------------

async function listUsers(
  page = 0,
  size = 10
): Promise<PageResponse<UserResponse>> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort: "name,asc",
  });

  const response = await fetch(
    `${API_BASE_URL}?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  handleHttpError(response, {
    forbidden: "Não tens permissão para consultar utilizadores.",
    generic: "Não foi possível carregar os utilizadores.",
  });

  return response.json() as Promise<PageResponse<UserResponse>>;
}

// ---------------------------------------------------------
// GET USER BY ID
// ---------------------------------------------------------

async function getUserById(
  userId: string
): Promise<UserResponse> {
  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(userId)}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  handleHttpError(response, {
    forbidden: "Não tens permissão para consultar este utilizador.",
    notFound: "O utilizador não foi encontrado.",
    generic: "Não foi possível consultar o utilizador.",
  });

  return response.json() as Promise<UserResponse>;
}

// ---------------------------------------------------------
// UPDATE USER
// ---------------------------------------------------------

async function updateUser(
  userId: string,
  request: UpdateUserRequest
): Promise<UserResponse> {
  const csrfHeaders = await getCsrfHeaders();

  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(userId)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...csrfHeaders,
      },
      body: JSON.stringify(request),
      cache: "no-store",
    }
  );

  handleHttpError(response, {
    badRequest: "Dados inválidos. Verifica os campos preenchidos.",
    forbidden: "Não tens permissão para editar utilizadores.",
    notFound: "O utilizador não foi encontrado.",
    conflict:
      "Não foi possível actualizar o utilizador. " +
      "Verifica se o username já existe ou se a alteração é permitida.",
    unprocessable: "Os dados informados são inválidos.",
    generic: "Erro ao actualizar utilizador.",
  });

  return response.json() as Promise<UserResponse>;
}

// ---------------------------------------------------------
// DEACTIVATE USER
// ---------------------------------------------------------

async function deactivateUser(
  userId: string
): Promise<UserResponse> {
  const csrfHeaders = await getCsrfHeaders();

  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(userId)}/deactivate`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...csrfHeaders,
      },
      cache: "no-store",
    }
  );

  handleHttpError(response, {
    forbidden: "Não tens permissão para desactivar utilizadores.",
    notFound: "O utilizador não foi encontrado.",
    conflict:
      "Não é possível desactivar a própria conta " +
      "ou o último administrador activo.",
    generic: "Erro ao desactivar utilizador.",
  });

  return response.json() as Promise<UserResponse>;
}

// ---------------------------------------------------------
// ACTIVATE USER
// ---------------------------------------------------------

async function activateUser(
  userId: string
): Promise<UserResponse> {
  const csrfHeaders = await getCsrfHeaders();

  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(userId)}/activate`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...csrfHeaders,
      },
      cache: "no-store",
    }
  );

  handleHttpError(response, {
    forbidden: "Não tens permissão para activar utilizadores.",
    notFound: "O utilizador não foi encontrado.",
    conflict: "Não é possível activar este utilizador.",
    generic: "Erro ao activar utilizador.",
  });

  return response.json() as Promise<UserResponse>;
}

// ---------------------------------------------------------
// RESET PASSWORD
// ---------------------------------------------------------

async function resetPassword(
  userId: string
): Promise<ResetPasswordResponse> {
  const csrfHeaders = await getCsrfHeaders();

  // Não repetir automaticamente esta operação.
  // Cada execução gera uma nova credencial temporária.
  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(userId)}/reset-password`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...csrfHeaders,
      },
      cache: "no-store",
    }
  );

  handleHttpError(response, {
    forbidden: "Não tens permissão para repor palavras-passe.",
    notFound: "O utilizador não foi encontrado.",
    conflict:
      "Não é possível repor a palavra-passe de uma conta inactiva.",
    generic: "Não foi possível repor a palavra-passe.",
  });

  // Validar a resposta sem repetir o pedido.
  const result: unknown = await response.json();

  if (
    typeof result !== "object" ||
    result === null ||
    !("temporaryPassword" in result) ||
    typeof result.temporaryPassword !== "string" ||
    result.temporaryPassword.length === 0 ||
    !("passwordChangeRequired" in result) ||
    result.passwordChangeRequired !== true
  ) {
    throw new Error(
      "A API aceitou a reposição, mas não devolveu " +
      "uma credencial no formato esperado. " +
      "Não repitas a operação antes de confirmar " +
      "o resultado no backend."
    );
  }

  return {
    temporaryPassword: result.temporaryPassword,
    passwordChangeRequired: true,
  };
}

// ---------------------------------------------------------
// EXPORT
// ---------------------------------------------------------

export const userService = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
  resetPassword,
};
