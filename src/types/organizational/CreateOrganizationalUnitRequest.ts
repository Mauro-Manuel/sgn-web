export interface CreateOrganizationalUnitRequest {
  code: string;
  name: string;
  type: string;
  territorialUnitId: string;
  parentId: string | null;
}