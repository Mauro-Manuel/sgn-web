
import { authService } from "./authService";

import type {
  BodyAuthorization,
  BodyAuthorizationPage,
  CreateBodyAuthorizationRequest,
} from "../types/bodyAuthorization/BodyAuthorization";

const BASE_URL = "/api/v1/body-authorizations";

function getXsrfToken(): string {
  const cookie = document.cookie
    .split("; ")
    .find(item => item.startsWith("XSRF-TOKEN="));

  return cookie
    ? decodeURIComponent(cookie.substring("XSRF-TOKEN=".length))
    : "";
}

async function getErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  const data: unknown = await response.json().catch(() => null);

  if (data && typeof data === "object" && "message" in data) {
    const message = data.message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return `${fallback} HTTP ${response.status}`;
}

export const bodyAuthorizationService = {
  async createBodyAuthorization(
    request: CreateBodyAuthorizationRequest
  ): Promise<void> {
    const csrf = await authService.getCsrfToken();

    const response = await fetch(BASE_URL, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        [csrf.headerName]: getXsrfToken(),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(
        await getErrorMessage(
          response,
          "Erro ao criar autorização."
        )
      );
    }
  },

  async listBodyAuthorizations(
    userId: string,
    signal?: AbortSignal
  ): Promise<BodyAuthorization[]> {
    const params = new URLSearchParams({ userId });

    const response = await fetch(
      `${BASE_URL}?${params.toString()}`,
      {
        method: "GET",
        credentials: "include",
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
          "Erro ao consultar autorizações."
        )
      );
    }

    const result: BodyAuthorization[] | BodyAuthorizationPage =
      await response.json();

    if (Array.isArray(result)) {
      return result;
    }

    if (result && Array.isArray(result.content)) {
      return result.content;
    }

    throw new Error(
      "Formato inesperado na resposta de autorizações."
    );
  },
};
