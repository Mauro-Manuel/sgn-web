
export const USER_ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
  SUPERVISOR_NUCLEO: "Supervisor de Núcleo",
  RESPONSAVEL_ORGAO_BASE: "Responsável do Órgão de Base",
};

export function getUserRoleLabel(role: string): string {
  return USER_ROLE_LABELS[role] ?? role;
}
