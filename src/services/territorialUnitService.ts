
import type { TerritorialUnit } from "../types/territorial/TerritorialUnit";

import { authService } from "./authService";

import type { CreateTerritorialUnitRequest } from
  "../types/territorial/CreateTerritorialUnitRequest";

const API_BASE_URL = "/api/v1/territorial-units";

async function getUnits(
  path: string
): Promise<TerritorialUnit[]> {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
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
      "Não tens permissão para consultar unidades territoriais."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Erro ao carregar unidades territoriais. HTTP ${response.status}`
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error(
      "Formato de resposta inesperado. " +
      "Verifica o contrato da API Territorial Units."
    );
  }

  return data as TerritorialUnit[];
}

async function getProvinces(): Promise<TerritorialUnit[]> {
  return getUnits("/provinces");
}

async function getMunicipalities(
  provinceId: string
): Promise<TerritorialUnit[]> {
  return getUnits(
    `/${encodeURIComponent(provinceId)}/municipalities`
  );
}

async function getCommunes(
  municipalityId: string
): Promise<TerritorialUnit[]> {
  return getUnits(
    `/${encodeURIComponent(municipalityId)}/communes`
  );
}


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

async function createTerritorialUnit(
  request: CreateTerritorialUnitRequest
): Promise<void> {
  const csrf = await authService.getCsrfToken();
  const xsrfToken = getCookie("XSRF-TOKEN");

  if (!xsrfToken) {
    throw new Error(
      "Token CSRF indisponível. Actualiza a página."
    );
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
        "Dados inválidos. Verifica o código, " +
        "o nível territorial e a unidade superior."
      );

    case 401:
      throw new Error(
        "A sessão expirou. Autentica-te novamente."
      );

    case 403:
      throw new Error(
        "Não tens permissão para criar unidades territoriais."
      );

    case 409:
      throw new Error(
        "Já existe uma unidade territorial com este código."
      );
  }

  if (!response.ok) {
    throw new Error(
      `Erro ao criar unidade territorial. HTTP ${response.status}`
    );
  }
}

async function getNationalUnits(): Promise<TerritorialUnit []> {
  return getUnits("/national");
}


async function getTerritorialUnitById(
  id: string
): Promise<TerritorialUnit> {
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
      `Erro ao consultar território. HTTP ${response.status}`
    );
  }

  return response.json() as Promise<TerritorialUnit>;
}



export const territorialUnitService = {
  getProvinces,
  getMunicipalities,
  getNationalUnits,
  getCommunes,
  createTerritorialUnit,
  getTerritorialUnitById
};
