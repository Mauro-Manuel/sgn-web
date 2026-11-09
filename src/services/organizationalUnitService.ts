
import { authService } from "./authService";

import type { CreateOrganizationalUnitRequest } from
  "../types/organizational/CreateOrganizationalUnitRequest";
  import type { PageResponse } from "../types/user/PageResponse";
  import type { OrganizationalUnit } from "../types/organizational/OrganizationalUnit";

const API_BASE_URL = "/api/v1/organizational-units";

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

async function createOrganizationalUnit(
  request: CreateOrganizationalUnitRequest
): Promise<void> {
  const csrf = await authService.getCsrfToken();
  const token = getCookie("XSRF-TOKEN");

  if (!token) {
    throw new Error("Token CSRF indisponível.");
  }

  const response = await fetch(API_BASE_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      [csrf.headerName]: token,
    },
    body: JSON.stringify(request),
  });

  if (response.status === 401) {
    throw new Error("A sessão expirou.");
  }

  if (response.status === 403) {
    throw new Error(
      "Não tens permissão para criar unidades organizacionais."
    );
  }

  if (response.status === 404) {
    throw new Error(
      "Unidade territorial ou organizacional superior não encontrada."
    );
  }

  if (response.status === 409) {
    throw new Error(
      "Já existe uma unidade organizacional com este código."
    );
  }

  if (response.status === 400 || response.status === 422) {
    throw new Error(
      "Dados inválidos. Verifica o tipo, o território e a unidade superior."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Erro ao criar unidade organizacional. HTTP ${response.status}`
    );
  }
}

async function listOrganizationalUnits(
  page = 0,
  size = 10
): Promise<PageResponse<OrganizationalUnit>> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
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

  if (response.status === 401) {
    throw new Error(
      "A sessão expirou. Autentica-te novamente."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "Não tens permissão para consultar unidades organizacionais."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Erro ao carregar unidades organizacionais. HTTP ${response.status}`
    );
  }

  const data: unknown = await response.json();

  if (
    typeof data !== "object" ||
    data === null ||
    !("content" in data) ||
    !Array.isArray(data.content)
  ) {
    throw new Error(
      "Formato de resposta inesperado da API Organizational Units."
    );
  }

  return data as unknown as PageResponse<OrganizationalUnit>;
}


async function getOrganizationalUnitById(
  id: string
): Promise<OrganizationalUnit> {
  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(id)}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Erro ao consultar unidade organizacional. HTTP ${response.status}`
    );
  }

  return response.json() as Promise<OrganizationalUnit>;
}



export const organizationalUnitService = {
  createOrganizationalUnit,
  listOrganizationalUnits,
  getOrganizationalUnitById
};
