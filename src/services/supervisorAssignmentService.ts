
import { authService } from "./authService";

import type { AssignSupervisorRequest } from "../types/assignment/AssignSupervisorRequest";
import type { SupervisorAssignment } from "../types/assignment/SupervisorAssignment";

const API_BASE_URL = "/api/v1/supervisor-assignments";

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

async function assignSupervisor(
  request: AssignSupervisorRequest
): Promise<SupervisorAssignment | null> {
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
    throw new Error("A sessão expirou. Autentica-te novamente.");
  }

  if (response.status === 403) {
    throw new Error(
      "Não tens permissão para atribuir Supervisores."
    );
  }

  if (response.status === 404) {
    throw new Error(
      "Supervisor ou Núcleo não encontrado."
    );
  }

  if (response.status === 409) {
    throw new Error(
      "Já existe uma atribuição incompatível com esta operação."
    );
  }

  if (response.status === 400 || response.status === 422) {
    throw new Error(
      "Atribuição inválida. Verifica o Supervisor e o Núcleo."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Erro ao atribuir Supervisor. HTTP ${response.status}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  const body = await response.text();

  if (!body) {
    return null;
  }

  return JSON.parse(body) as SupervisorAssignment;
}

export const supervisorAssignmentService = {
  assignSupervisor,
};
