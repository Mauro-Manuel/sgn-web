
import type { TerritorialLevel } from "./TerritorialUnit";

export interface CreateTerritorialUnitRequest {
  code: string;
  name: string;
  level: TerritorialLevel;
  parentId: string | null;
}
