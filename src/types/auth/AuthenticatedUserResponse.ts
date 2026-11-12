
export interface AuthenticatedUserResponse {
  id: string;
  name: string;
  username: string;
  role: string;
  passwordChangeRequired: boolean;
  permissions: string[];
}
