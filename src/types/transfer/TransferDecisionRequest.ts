
export type TransferDecision = "APROVADA" | "REJEITADA";

export interface TransferDecisionRequest {
  decision: TransferDecision;
  decisionReference: string;
}
