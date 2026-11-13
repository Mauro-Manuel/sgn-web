
import { authService } from "./authService";

import type { TransferPage } from "../types/transfer/TransferDetail";

const API_BASE_URL = "/api/v1/transfers";

export interface AssignTransferCompetentBodyRequest {
  competentBodyId: string;
  designationReference: string;
}

function getCookie(name: string): string | null {
  const cookie = document.cookie
    .split("; ")
    .find(item => item.startsWith(`${name}=`));

  return cookie
    ? decodeURIComponent(cookie.substring(name.length + 1))
    : null;
}

async function checkResponse(
  response: Response
): Promise<void> {
  if (response.status === 401) {
    throw new Error(
      "A sessão expirou. Autentica-te novamente."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "Não tens permissão para encaminhar transferências."
    );
  }

  if (response.status === 404) {
    throw new Error(
      "Transferência ou órgão competente não encontrado."
    );
  }

  if (response.status === 409) {
    throw new Error(
      "Esta transferência não pode ser encaminhada " +
      "no estado actual."
    );
  }

  if (
    response.status === 400 ||
    response.status === 422
  ) {
    throw new Error(
      "Dados inválidos. Verifica o órgão competente " +
      "e a referência da designação."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Erro ao processar transferência. HTTP ${response.status}`
    );
  }
}

async function listPendingRouting(
  page = 0,
  size = 10,
  signal?: AbortSignal
): Promise<TransferPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  const response = await fetch(
    `${API_BASE_URL}/pending-routing?${params.toString()}`,
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

  await checkResponse(response);

  const result: unknown = await response.json();

  if (
    !result ||
    typeof result !== "object" ||
    !("content" in result) ||
    !Array.isArray(result.content) ||
    !("totalElements" in result) ||
    typeof result.totalElements !== "number" ||
    !("totalPages" in result) ||
    typeof result.totalPages !== "number"
  ) {
    throw new Error(
      "Formato inesperado da lista de transferências."
    );
  }

  return result as TransferPage;
}

async function assignCompetentBody(
  transferId: string,
  request: AssignTransferCompetentBodyRequest
): Promise<void> {
  const reference = request.designationReference.trim();

  if (!request.competentBodyId) {
    throw new Error(
      "Selecciona o órgão competente."
    );
  }

  if (!reference || reference.length > 150) {
    throw new Error(
      "A referência deve conter entre 1 e 150 caracteres."
    );
  }

  const csrf = await authService.getCsrfToken();
  const token = getCookie("XSRF-TOKEN");

  if (!token) {
    throw new Error("Token CSRF indisponível.");
  }

  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(transferId)}/competent-body`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        [csrf.headerName]: token,
      },
      body: JSON.stringify({
        competentBodyId: request.competentBodyId,
        designationReference: reference,
      }),
    }
  );

  await checkResponse(response);

  // Não ler JSON: a operação não exige
  // qualquer corpo de resposta.
}

export const transferCompetentBodyService = {
  listPendingRouting,
  assignCompetentBody,
};
