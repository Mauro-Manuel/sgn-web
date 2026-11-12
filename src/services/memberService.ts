
import { authService } from "./authService";

import type { RegisterMemberRequest } from "../types/member/RegisterMemberRequest";
import type { RegisterMemberResponse } from "../types/member/RegisterMemberResponse";
import type { MemberDetails } from "../types/member/MemberDetails";
import type { MemberAdmissionHistory } from "../types/member/MemberAdmissionHistory";
import type { MemberAssignmentHistory } from "../types/member/MemberAssignmentHistory";

import type {
  Member,
  MemberSearchStatus,
} from "../types/member/Member";

import type { PageResponse } from "../types/user/PageResponse";

const API_BASE_URL = "/api/v1/members";

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

async function registerMember(
  request: RegisterMemberRequest
): Promise<RegisterMemberResponse> {
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
  });

  if (response.status === 401) {
    throw new Error(
      "A sessão expirou. Autentica-te novamente."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "Sem permissão para registar militantes. " +
      "Confirma que és Supervisor de um Núcleo activo."
    );
  }

  if (response.status === 409) {
    throw new Error(
      "Não foi possível concluir o registo. " +
      "O Bilhete de Identidade poderá já estar registado."
    );
  }

  if (response.status === 400 || response.status === 422) {
    throw new Error(
      "Dados inválidos. Confirma os campos do formulário."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Erro ao registar militante. HTTP ${response.status}`
    );
  }

  const data: unknown = await response.json();

  if (
    typeof data !== "object" ||
    data === null ||
    !("id" in data) ||
    typeof data.id !== "string" ||
    !("admissionStatus" in data) ||
    data.admissionStatus !== "PENDENTE"
  ) {
    throw new Error(
      "A API devolveu uma resposta inesperada. " +
      "Confirma o registo antes de repetir a operação."
    );
  }

  return data as RegisterMemberResponse;
}

interface ListMembersParams {
  page?: number;
  size?: number;
  search?: string;
  status?: MemberSearchStatus | "";
}

async function listMembers({
  page = 0,
  size = 10,
  search = "",
  status = "",
}: ListMembersParams = {}): Promise<PageResponse<Member>> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  const normalizedSearch = search.trim();

  if (normalizedSearch) {
    params.set("search", normalizedSearch);
  }

  if (status) {
    params.set("status", status);
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
    }
  );

  if (response.status === 401) {
    throw new Error(
      "A sessão expirou. Autentica-te novamente."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "Não tens permissão para consultar militantes."
    );
  }

  if (response.status === 400) {
    throw new Error(
      "Os parâmetros de pesquisa são inválidos."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Erro ao consultar militantes. HTTP ${response.status}`
    );
  }

  const data: unknown = await response.json();

  if (
    typeof data !== "object" ||
    data === null ||
    !("content" in data) ||
    !Array.isArray(data.content) ||
    !("totalElements" in data) ||
    typeof data.totalElements !== "number" ||
    !("totalPages" in data) ||
    typeof data.totalPages !== "number" ||
    !("number" in data) ||
    typeof data.number !== "number"
  ) {
    throw new Error(
      "Formato de resposta inesperado da API de militantes."
    );
  }

  return data as unknown as PageResponse<Member>;
}

async function getMemberById(
  memberId: string,
  signal?: AbortSignal
): Promise<MemberDetails> {
  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(memberId)}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      signal,
    }
  );

  if (response.status === 401) {
    throw new Error(
      "A sessão expirou. Inicia sessão novamente."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "Não tens permissão para consultar este militante."
    );
  }

  if (response.status === 404) {
    throw new Error(
      "Militante não encontrado."
    );
  }

  if (!response.ok) {
    throw new Error(
      "Não foi possível consultar os detalhes do militante."
    );
  }

  return response.json() as Promise<MemberDetails>;
}

async function getMemberAdmissionHistory(
  memberId: string,
  signal?: AbortSignal
): Promise<MemberAdmissionHistory[]> {
  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(memberId)}/admissions`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      signal,
    }
  );

  if (response.status === 401) {
    throw new Error(
      "A sessão expirou. Inicia sessão novamente."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "Não tens permissão para consultar o histórico de admissões."
    );
  }

  if (response.status === 404) {
    throw new Error(
      "Histórico de admissões não encontrado."
    );
  }

  if (!response.ok) {
    throw new Error(
      "Não foi possível consultar o histórico de admissões."
    );
  }

  const result: unknown = await response.json();

  if (!Array.isArray(result)) {
    throw new Error(
      "Formato inesperado do histórico de admissões."
    );
  }

  return result as MemberAdmissionHistory[];
}


async function getMemberAssignmentHistory(
  memberId: string,
  signal?: AbortSignal
): Promise<MemberAssignmentHistory[]> {
  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(memberId)}/assignments`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
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
      "Não tens permissão para consultar o histórico de enquadramentos."
    );
  }

  if (response.status === 404) {
    throw new Error(
      "Histórico de enquadramentos não encontrado."
    );
  }

  if (!response.ok) {
    throw new Error(
      "Não foi possível consultar o histórico de enquadramentos."
    );
  }

  const result: unknown = await response.json();

  if (!Array.isArray(result)) {
    throw new Error(
      "Formato inesperado do histórico de enquadramentos."
    );
  }

  return result as MemberAssignmentHistory[];
}


export const memberService = {
  registerMember,
  listMembers,
  getMemberById,
  getMemberAdmissionHistory,
  getMemberAssignmentHistory
};
