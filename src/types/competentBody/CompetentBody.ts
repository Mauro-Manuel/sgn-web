
export interface CreateCompetentBodyRequest {
  code: string;
  name: string;
  organizationalUnitId: string;
}

export interface CompetentBody {
  id: string;
  code: string;
  name: string;
  organizationalUnitId: string;
  active?: boolean;
}

export interface CompetentBodyPage {
  content: CompetentBody[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
