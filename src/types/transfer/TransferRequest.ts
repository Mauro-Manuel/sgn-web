
export interface CreateTransferRequest {
  memberId: string;
  destinationNucleusId: string;
  reason: string;
}

export interface CreateTransferResponse {
  id: string;
  status: "PENDENTE";
}
