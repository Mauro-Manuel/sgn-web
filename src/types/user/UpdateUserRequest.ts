
import type { UserRole } from "./UserRole";

export interface UpdateUserRequest {
  name: string;
  username: string;
  role: UserRole;
}
