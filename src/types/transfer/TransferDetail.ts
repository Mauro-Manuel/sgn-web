export const TRANSFER_STATUSES = ["PENDENTE", "APROVADA", "REJEITADA"] as const;

// Os estados APROVADA e REJEITADA são provisórios.
// Devem ser confirmados com o enum TransferStatus do backend.
export type TransferStatus = "PENDENTE" | "APROVADA" | "REJEITADA";

export interface TransferDetail {
  id: string;
  memberId: string;
  memberName: string;
  sourceNucleusId: string;
  sourceNucleusName: string;
  destinationNucleusId: string;
  destinationNucleusName: string;
  reason: string;
  status: TransferStatus;
  requestedById: string;
  requestedAt: string;
  decidedById: string | null;
  decidedAt: string | null;
  decisionReference: string | null;
  competentBodyId?: string | null;
  competentBodyName?: string | null;
  designationReference?: string | null;
}

export interface TransferPage {
  content: TransferDetail[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface TransferSearchParams {
  status?: string;
  page?: number;
  size?: number;
}
