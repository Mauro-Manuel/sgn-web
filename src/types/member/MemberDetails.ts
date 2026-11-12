
export interface MemberDetails {
  id: string;
  fullName: string;
  phoneNumber: string | null;
  email: string | null;
  admissionStatus:
    | "PENDENTE"
    | "ADMITIDO"
    | "NAO_ADMITIDO";
  status: "ACTIVO" | "INACTIVO" | "DESVINCULADO";
  nucleusId: string | null;
  nucleusName: string | null;
}
