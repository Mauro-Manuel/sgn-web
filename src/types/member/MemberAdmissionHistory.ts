
export interface MemberAdmissionHistory {
  id: string;
  nucleusId: string;
  nucleusName: string;
  status: "PENDENTE" | "ADMITIDO" | "NAO_ADMITIDO";
  decisionReference: string | null;
}
