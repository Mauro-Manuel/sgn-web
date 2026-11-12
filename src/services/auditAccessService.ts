
import { authService } from "./authService";

const API_BASE_URL = "/api/v1/users";

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

async function changeAuditAccess(
  userId: string,
  operation: "grant" | "revoke"
): Promise<void> {
  const csrf = await authService.getCsrfToken();
  const xsrfToken = getCookie("XSRF-TOKEN");

  if (!xsrfToken) {
    throw new Error("Token CSRF indisponível.");
  }

  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(userId)}/audit-access/${operation}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        [csrf.headerName]: xsrfToken,
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
      "Não tens permissão para gerir acessos à auditoria."
    );
  }

  if (response.status === 404) {
    throw new Error(
      "O administrador seleccionado não foi encontrado."
    );
  }

  if (response.status === 400) {
    throw new Error(
      "Não foi possível realizar a operação. Verifica o administrador seleccionado."
    );
  }

  if (response.status === 409) {
    throw new Error(
      "A operação não pode ser concluída devido ao estado actual do acesso."
    );
  }

  if (!response.ok) {
    throw new Error(
      `Erro ao actualizar o acesso à auditoria. HTTP ${response.status}`
    );
  }
}

async function grantAuditAccess(
  userId: string
): Promise<void> {
  await changeAuditAccess(userId, "grant");
}

async function revokeAuditAccess(
  userId: string
): Promise<void> {
  await changeAuditAccess(userId, "revoke");
}

export const auditAccessService = {
  grantAuditAccess,
  revokeAuditAccess,
};
