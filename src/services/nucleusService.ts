
import { authService } from "./authService";

import type { CreateNucleusRequest } from "../types/nucleus/CreateNucleusRequest";
import type { Nucleus } from "../types/nucleus/Nucleus";
import type { UpdateNucleusRequest } from "../types/nucleus/UpdateNucleusRequest";

const API_BASE_URL = "/api/v1/nuclei";

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

async function createNucleus(
  request: CreateNucleusRequest
): Promise<Nucleus> {
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

  switch (response.status) {
    case 400:
    case 422:
      throw new Error(
        "Dados inválidos. Verifica o código, nome e unidade organizacional."
      );

    case 401:
      throw new Error("A sessão expirou.");

    case 403:
      throw new Error(
        "Não tens permissão para criar Núcleos."
      );

    case 404:
      throw new Error(
        "Unidade organizacional não encontrada."
      );

    case 409:
      throw new Error(
        "Já existe um Núcleo com este código."
      );
  }

  if (!response.ok) {
    throw new Error(
      `Erro ao criar Núcleo. HTTP ${response.status}`
    );
  }

  if (response.status === 204) {
    throw new Error(
      "Núcleo criado, mas a API não devolveu os dados esperados. " +
      "Verifica o registo antes de repetir."
    );
  }

  const result: unknown = await response.json();

  if (
    !result ||
    typeof result !== "object" ||
    !("id" in result) ||
    typeof result.id !== "string"
  ) {
    throw new Error(
      "Resposta de criação inesperada. " +
      "Verifica o registo no backend antes de repetir."
    );
  }

  return result as unknown as Nucleus;
}



async function listNuclei(): Promise<Nucleus[]> {
  const response = await fetch(API_BASE_URL, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    throw new Error("A sessão expirou. Autentica-te novamente.");
  }

  if (response.status === 403) {
    throw new Error(
      "Não tens permissão para consultar os Núcleos."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Erro ao carregar Núcleos. HTTP ${response.status}`
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error(
      "Formato de resposta inesperado da API de Núcleos."
    );
  }

  return data as Nucleus[];
}


async function updateNucleus(
  id: string,
  request: UpdateNucleusRequest
): Promise<void> {
  const csrf = await authService.getCsrfToken();
  const xsrfToken = getCookie("XSRF-TOKEN");

  if (!xsrfToken) {
    throw new Error("Token CSRF indisponível.");
  }

  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        [csrf.headerName]: xsrfToken,
      },
      body: JSON.stringify(request),
    }
  );

  if (response.status === 400 || response.status === 422) {
    throw new Error(
      "Nome inválido. Verifica se foi preenchido correctamente."
    );
  }

  if (response.status === 401) {
    throw new Error("A sessão expirou. Autentica-te novamente.");
  }

  if (response.status === 403) {
    throw new Error("Não tens permissão para editar Núcleos.");
  }

  if (response.status === 404) {
    throw new Error("Núcleo não encontrado.");
  }

  if (response.status === 409) {
    throw new Error("Conflito ao actualizar o Núcleo.");
  }

  if (!response.ok) {
    throw new Error(
      `Erro ao actualizar Núcleo. HTTP ${response.status}`
    );
  }
}

async function deactivateNucleus(id: string): Promise<void> {
  const csrf = await authService.getCsrfToken();
  const xsrfToken = getCookie("XSRF-TOKEN");

  if (!xsrfToken) {
    throw new Error("Token CSRF indisponível.");
  }

  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(id)}/deactivate`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        [csrf.headerName]: xsrfToken,
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
      "Não tens permissão para desactivar Núcleos."
    );
  }

  if (response.status === 404) {
    throw new Error("Núcleo não encontrado.");
  }

  if (response.status === 409) {
    throw new Error(
      "Não foi possível desactivar o Núcleo devido a um conflito."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Erro ao desactivar Núcleo. HTTP ${response.status}`
    );
  }
}


async function activateNucleus(id: string): Promise<void> {
  const csrf = await authService.getCsrfToken();
  const xsrfToken = getCookie("XSRF-TOKEN");

  if (!xsrfToken) {
    throw new Error("Token CSRF indisponível.");
  }

  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(id)}/activate`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        [csrf.headerName]: xsrfToken,
      },
    }
  );

  if (response.status === 401) {
    throw new Error("A sessão expirou. Autentica-te novamente.");
  }

  if (response.status === 403) {
    throw new Error("Não tens permissão para activar Núcleos.");
  }

  if (response.status === 404) {
    throw new Error("Núcleo não encontrado.");
  }

  if (response.status === 409) {
    throw new Error(
      "Não foi possível activar o Núcleo devido a um conflito."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Erro ao activar Núcleo. HTTP ${response.status}`
    );
  }
}


export const nucleusService = {
  createNucleus,
  listNuclei,
  updateNucleus,
  deactivateNucleus,
  activateNucleus
};
