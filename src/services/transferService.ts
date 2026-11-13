
import { authService } from "./authService";

import type {
  CreateTransferRequest,
  CreateTransferResponse,
} from "../types/transfer/TransferRequest";

import type {
  TransferDetail,
  TransferPage,
  TransferSearchParams,
} from "../types/transfer/TransferDetail";

import type {
  TransferDecisionRequest,
} from "../types/transfer/TransferDecisionRequest";

const API_BASE_URL = "/api/v1/transfers";

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

async function requestTransfer(
  request: CreateTransferRequest
): Promise<CreateTransferResponse> {
  const csrf = await authService.getCsrfToken();
  const xsrfToken = getCookie("XSRF-TOKEN");

  if (!xsrfToken) {
    throw new Error("Token CSRF indisponível.");
  }

  const response = await fetch(API_BASE_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      [csrf.headerName]: xsrfToken,
    },
    body: JSON.stringify(request),
    cache: "no-store",
  });

  if (response.status === 401) {
    throw new Error(
      "A sessão expirou. Autentica-te novamente."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "Não tens permissão para solicitar esta transferência."
    );
  }

  if (response.status === 404) {
    throw new Error(
      "O militante ou o Núcleo seleccionado não foi encontrado."
    );
  }

  if (response.status === 409) {
    throw new Error(
      "Não foi possível solicitar a transferência. " +
      "Verifica se já existe um pedido pendente ou " +
      "se o militante pode ser transferido."
    );
  }

  if (
    response.status === 400 ||
    response.status === 422
  ) {
    throw new Error(
      "Os dados da transferência são inválidos. " +
      "Verifica o Núcleo de destino e o motivo."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Erro ao solicitar transferência. HTTP ${response.status}`
    );
  }

  const result: unknown = await response.json();

  if (
    typeof result !== "object" ||
    result === null ||
    !("id" in result) ||
    typeof result.id !== "string" ||
    !("status" in result) ||
    result.status !== "PENDENTE"
  ) {
    throw new Error(
      "A API devolveu uma resposta inesperada. " +
      "Confirma se a transferência foi registada " +
      "antes de repetir a operação."
    );
  }

  return result as CreateTransferResponse;
}


async function listTransfers(
  filters: TransferSearchParams = {},
  signal?: AbortSignal
): Promise<TransferPage> {
  const params = new URLSearchParams({
    page: String(filters.page ?? 0),
    size: String(filters.size ?? 10),
    sort: "requestedAt,desc",
  });

  if (filters.status) {
    params.set("status", filters.status);
  }

  const response = await fetch(
    `${API_BASE_URL}?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal,
    }
  );

  if (response.status === 401) {
    throw new Error(
      "A sessão expirou. Autentica-te novamente."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "Não tens permissão para consultar transferências."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Não foi possível consultar transferências. HTTP ${response.status}`
    );
  }

  const result: unknown = await response.json();

  if (
    typeof result !== "object" ||
    result === null ||
    !("content" in result) ||
    !Array.isArray(result.content) ||
    !("totalElements" in result) ||
    typeof result.totalElements !== "number" ||
    !("totalPages" in result) ||
    typeof result.totalPages !== "number" ||
    !("number" in result) ||
    typeof result.number !== "number"
  ) {
    throw new Error(
      "Formato inesperado da listagem de transferências."
    );
  }

  return result as TransferPage;
}

async function getTransferById(
  id: string,
  signal?: AbortSignal
): Promise<TransferDetail> {
  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(id)}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal,
    }
  );

  if (response.status === 401) {
    throw new Error(
      "A sessão expirou. Autentica-te novamente."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "Não tens permissão para consultar esta transferência."
    );
  }

  if (response.status === 404) {
    throw new Error(
      "Transferência não encontrada."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Não foi possível consultar a transferência. HTTP ${response.status}`
    );
  }

  return response.json() as Promise<TransferDetail>;
}


async function decideTransfer(
  transferId: string,
  request: TransferDecisionRequest
): Promise<void> {
  const csrf = await authService.getCsrfToken();
  const xsrfToken = getCookie("XSRF-TOKEN");

  if (!xsrfToken) {
    throw new Error("Token CSRF indisponível.");
  }

  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(transferId)}/decisions`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        [csrf.headerName]: xsrfToken,
      },
      body: JSON.stringify(request),
      cache: "no-store",
    }
  );

  if (response.status === 401) {
    throw new Error(
      "A sessão expirou. Autentica-te novamente."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "Não tens autorização para decidir esta transferência."
    );
  }

  if (response.status === 404) {
    throw new Error(
      "Pedido de transferência não encontrado."
    );
  }

  if (response.status === 409) {
    throw new Error(
      "Não foi possível concluir a decisão. " +
      "O pedido poderá já ter sido decidido ou " +
      "não estar em condições de ser processado."
    );
  }

  if (
    response.status === 400 ||
    response.status === 422
  ) {
    throw new Error(
      "Dados da decisão inválidos. " +
      "Verifica a decisão e a referência informada."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Erro ao decidir transferência. HTTP ${response.status}`
    );
  }

  // A API devolve 204 No Content.
  // Não executar response.json().
}



async function listPendingTransferDecisions(
  page = 0,
  size = 10,
  signal?: AbortSignal
): Promise<TransferPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  const response = await fetch(
    `${API_BASE_URL}/pending-decisions?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal,
    }
  );

  if (response.status === 401) {
    throw new Error(
      "A sessão expirou. Autentica-te novamente."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "Não tens autorização para consultar as transferências pendentes."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Erro ao consultar transferências pendentes. HTTP ${response.status}`
    );
  }

  const result: unknown = await response.json();

  if (
    typeof result !== "object" ||
    result === null ||
    !("content" in result) ||
    !Array.isArray(result.content) ||
    !("totalElements" in result) ||
    typeof result.totalElements !== "number" ||
    !("totalPages" in result) ||
    typeof result.totalPages !== "number"
  ) {
    throw new Error(
      "Formato inesperado da listagem de transferências pendentes."
    );
  }

  return result as TransferPage;
}



export const transferService = {
  requestTransfer,
  listTransfers,
  getTransferById,
  decideTransfer,
  listPendingTransferDecisions
};
