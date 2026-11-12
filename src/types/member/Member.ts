export type AdmissionStatus = "PENDENTE" | "ADMITIDO" | "NAO_ADMITIDO";

export type MemberStatus = "ACTIVO" | "INACTIVO" | "DESVINCULADO";

export type MemberSearchStatus = AdmissionStatus | MemberStatus;

export interface Member {
  id: string;
  fullName: string;
  phoneNumber: string | null;
  admissionStatus: AdmissionStatus | null;
  status: MemberStatus | null;
  nucleusId: string;
  nucleusName: string;
}
