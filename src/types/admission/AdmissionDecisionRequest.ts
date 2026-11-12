
export type AdmissionDecision = "ADMITIDO" | "NAO_ADMITIDO";

export interface AdmissionDecisionRequest {
  decision: AdmissionDecision;
  decisionReference: string;
}
