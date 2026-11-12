
import { authService } from "./authService";

import type {
  CompetentBody,
  CompetentBodyPage,
  CreateCompetentBodyRequest,
} from "../types/competentBody/CompetentBody";

const API_URL = "/api/v1/competent-bodies";

function getXsrfToken(): string {
  const cookie = document.cookie
    .split("; ")
    .find(item => item.startsWith("XSRF-TOKEN="));

  if (!cookie) {
    throw new Error("Token CSRF indisponível.");
  }

  return decodeURIComponent(
    cookie.substring("XSRF-TOKEN=".length)
  );
}

async function getErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  if (response.status === 401) {
    return "A sessão expirou. Inicia sessão novamente.";
  }

  if (response.status === 403) {
    return "Não tens permissão para esta operação.";
  }

  if (response.status === 409) {
    return "Já existe um órgão competente com estes dados.";
  }

  const body: unknown = await response.json().catch(() => null);

  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return `${fallback} (HTTP ${response.status})`;
}

async function listCompetentBodies(
  page = 0,
  size = 10,
  signal?: AbortSignal
): Promise<CompetentBodyPage> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  const response = await fetch(
    `${API_URL}?${params.toString()}`,
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

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Não foi possível carregar os órgãos competentes."
      )
    );
  }

  const result: CompetentBodyPage = await response.json();

  if (!Array.isArray(result.content)) {
    throw new Error("Resposta de listagem inválida.");
  }

  return result;
}

async function createCompetentBody(
  request: CreateCompetentBodyRequest
): Promise<CompetentBody | null> {
  const csrf = await authService.getCsrfToken();

  const response = await fetch(API_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      [csrf.headerName]: getXsrfToken(),
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Não foi possível criar o órgão competente."
      )
    );
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) as CompetentBody : null;
}

export const competentBodyService = {
  listCompetentBodies,
  createCompetentBody,
};
