
import { authService } from "./authService";

import type { AdmissionDecisionRequest } from "../types/admission/AdmissionDecisionRequest";
import type {
  AdmissionListResponse,
  AdmissionPageResponse,
} from "../types/admission/AdmissionListResponse";

const API_BASE_URL = "/api/v1/admissions";

function getCookie(name: string): string | null {
  const cookie = document.cookie
    .split("; ")
    .find(item => item.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(
    cookie.substring(name.length + 1)
  );
}

async function decideAdmission(
  admissionId: string,
  request: AdmissionDecisionRequest
): Promise<void> {
  const csrf = await authService.getCsrfToken();
  const xsrfToken = getCookie("XSRF-TOKEN");

  if (!xsrfToken) {
    throw new Error("Token CSRF indisponível.");
  }

  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(admissionId)}/decisions`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        [csrf.headerName]: xsrfToken,
      },
      body: JSON.stringify(request),
    }
  );

  if (response.status === 401) {
    throw new Error(
      "A sessão expirou. Autentica-te novamente."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "Não tens permissão para decidir esta admissão."
    );
  }

  if (response.status === 404) {
    throw new Error(
      "Pedido de admissão não encontrado."
    );
  }

  if (response.status === 409) {
    throw new Error(
      "Não foi possível efectuar a decisão. " +
      "O pedido poderá já ter sido decidido."
    );
  }

  if (response.status === 400 || response.status === 422) {
    throw new Error(
      "Decisão inválida. Verifica a decisão e a referência."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Erro ao decidir admissão. HTTP ${response.status}`
    );
  }
}


async function listAdmissions(
  page = 0,
  size = 20,
  signal?: AbortSignal
): Promise<AdmissionPageResponse> {
  const params = new URLSearchParams({
    status: "PENDENTE",
    page: String(page),
    size: String(size),
  });

  const response = await fetch(
    `${API_BASE_URL}?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal,
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (response.status === 401) {
    throw new Error(
      "A sessão expirou. Autentica-te novamente."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "Não tens permissão para consultar as admissões."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Erro ao consultar admissões. HTTP ${response.status}`
    );
  }

  const data: AdmissionPageResponse = await response.json();

  if (
    !Array.isArray(data.content) ||
    typeof data.totalPages !== "number"
  ) {
    throw new Error(
      "A API devolveu uma resposta de admissões inválida."
    );
  }

  return data;
}

async function listAllPendingAdmissions(
  signal?: AbortSignal
): Promise<AdmissionListResponse[]> {
  const firstPage = await listAdmissions(0, 20, signal);
  const admissions = [...firstPage.content];

  for (let page = 1; page < firstPage.totalPages; page++) {
    const result = await listAdmissions(page, 20, signal);
    admissions.push(...result.content);
  }

  return admissions;
}


export const admissionService = {
  decideAdmission,
  listAdmissions,
  listAllPendingAdmissions
};
