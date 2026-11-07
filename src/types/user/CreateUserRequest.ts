
import type { UserRole } from "./UserRole";

export interface CreateUserRequest {
    name: string;
    username: string;
    password: string;
    role: UserRole;
}
