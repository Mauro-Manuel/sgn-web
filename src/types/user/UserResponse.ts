
import type { UserRole } from "./UserRole";

export interface UserResponse {
    id: string;
    name: string;
    username: string;
    role: UserRole;
    active: boolean;
    passwordChangeRequired: boolean;
}
