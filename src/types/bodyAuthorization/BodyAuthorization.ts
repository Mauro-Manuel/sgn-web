
export interface CreateBodyAuthorizationRequest {
  userId: string;
  competentBodyId: string;
  validFrom: string;
  validUntil: string | null;
}

export interface BodyAuthorization {
  id: string;
  userId: string;
  competentBodyId: string;
  validFrom: string;
  validUntil: string | null;
}

export interface BodyAuthorizationPage {
  content: BodyAuthorization[];
  totalElements: number;
  totalPages: number;
}
