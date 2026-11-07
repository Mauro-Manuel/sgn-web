
export interface AuthenticatedUserResponse {
    userId: string;
    name: string;
    username: string;
    role: string;
    passwordChangeRequired: boolean;
}
