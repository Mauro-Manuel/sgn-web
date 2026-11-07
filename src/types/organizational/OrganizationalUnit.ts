
export interface OrganizationalUnit {
  id: string;
  code: string;
  name: string;
  type: string;
  parentId: string | null;
  territorialUnitId: string;
  active: boolean;
}
