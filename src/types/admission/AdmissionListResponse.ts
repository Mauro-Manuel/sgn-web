
export type AdmissionStatus =
  | "PENDENTE"
  | "ADMITIDO"
  | "NAO_ADMITIDO";

export interface AdmissionListResponse {
  id: string;
  memberName: string;
  nucleusName: string;
  status: AdmissionStatus;
}

export interface AdmissionPageResponse {
  content: AdmissionListResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
