

export type TerritorialLevel =
  | "NATIONAL"
  | "PROVINCIAL"
  | "MUNICIPAL"
  | "COMMUNAL"
  | "LOCAL";


export interface TerritorialUnit {
  id: string;
  code: string;
  name: string;
  level: TerritorialLevel;
  parentId: string | null;
  active: boolean;
}
