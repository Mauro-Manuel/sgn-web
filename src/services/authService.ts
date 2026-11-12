
import type { LoginRequest } from "../types/auth/LoginRequest";
import type { LoginResponse } from "../types/auth/LoginResponse";
import type { CsrfToken } from "../types/auth/CsrfToken";
import type { ChangePasswordRequest } from "../types/auth/ChangePasswordRequest";
import { AuthenticatedUserResponse } from "../types/auth/AuthenticatedUserResponse";


const API_BASE_URL = "/api/v1/auth";

function getCookie(name: string): string | null {
    const cookie = document.cookie
        .split("; ")
        .find(item => item.startsWith(`${name}=`));

    if (!cookie) {
        return null;
    }

    return decodeURIComponent(
        cookie.substring(name.length + 1)
    );
}

async function getCsrfToken(): Promise<CsrfToken> {
    const response = await fetch(`${API_BASE_URL}/csrf`, {
        method: "GET",
        credentials: "include",
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(
            `Erro ao obter CSRF. HTTP ${response.status}`
        );
    }

    const csrf: CsrfToken = await response.json();

    if (!csrf.headerName) {
        throw new Error("Resposta CSRF inválida.");
    }

    return csrf;
}


async function login(
    credentials: LoginRequest
): Promise<LoginResponse> {
    const csrf = await getCsrfToken();

    // O Spring Security SPA espera o token original
    // disponível no cookie XSRF-TOKEN.
    const xsrfToken = getCookie("XSRF-TOKEN");

    if (!xsrfToken) {
        throw new Error(
            "Não foi possível iniciar sessão. Actualiza a página e tenta novamente."
        );
    }

    let response: Response;

    try {
        response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                [csrf.headerName]: xsrfToken
            },
            body: JSON.stringify(credentials)
        });
    } catch {
        throw new Error(
            "Não foi possível estabelecer ligação ao servidor. Verifica a ligação e tenta novamente."
        );
    }

    // Credenciais inválidas.
    if (response.status === 401) {
        throw new Error(
            "Nome de utilizador ou palavra-passe incorrectos. Verifica os dados e tenta novamente."
        );
    }

    // Acesso recusado ou falha na validação CSRF.
    if (response.status === 403) {
        throw new Error(
            "Não foi possível concluir a autenticação. Actualiza a página e tenta novamente."
        );
    }

    // Limite de tentativas.
    if (response.status === 429) {
        throw new Error(
            "Demasiadas tentativas de autenticação. Aguarda alguns minutos e tenta novamente."
        );
    }

    // Erros internos ou indisponibilidade do servidor.
    if (response.status >= 500) {
        throw new Error(
            "O serviço de autenticação está temporariamente indisponível. Tenta novamente mais tarde."
        );
    }

    // Outros erros.
    if (!response.ok) {
        throw new Error(
            "Não foi possível iniciar sessão. Tenta novamente."
        );
    }

    const loginResponse: LoginResponse = await response.json();

    // Após autenticação, obter um CSRF actualizado
    // para as próximas operações protegidas.
    await getCsrfToken();

    return loginResponse;
}


async function changePassword(
    request: ChangePasswordRequest
): Promise<void> {
    const csrf = await getCsrfToken();

    const xsrfToken = getCookie("XSRF-TOKEN");

    if (!xsrfToken) {
        throw new Error(
            "Token CSRF indisponível. Actualiza a página e tenta novamente."
        );
    }

    const response = await fetch(
        `${API_BASE_URL}/change-password`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                [csrf.headerName]: xsrfToken
            },
            body: JSON.stringify(request)
        }
    );

    if (response.status === 401) {
        throw new Error(
            "A sessão expirou. É necessário autenticar novamente."
        );
    }

    if (response.status === 403) {
        throw new Error(
            "Operação recusada. Verifica a sessão ou o token CSRF."
        );
    }

    if (response.status === 400) {
        throw new Error(
            "Alteração rejeitada. Confirma a palavra-passe actual e os requisitos da nova palavra-passe."
        );
    }

    if (!response.ok) {
        throw new Error(
            `Não foi possível alterar a palavra-passe. HTTP ${response.status}`
        );
    }
}



async function getAuthenticatedUser(): Promise<AuthenticatedUserResponse> {
    const response = await fetch(`${API_BASE_URL}/me`, {
        method: "GET",
        credentials: "include",
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(
            "Não foi possível confirmar a sessão autenticada."
        );
    }

    return response.json() as Promise<AuthenticatedUserResponse>;
}


async function logout(): Promise<void> {
    const csrf = await getCsrfToken();

    const xsrfToken = getCookie("XSRF-TOKEN");

    if (!xsrfToken) {
        throw new Error(
            "Token CSRF indisponível. Não foi possível terminar a sessão."
        );
    }

    const response = await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
            [csrf.headerName]: xsrfToken
        }
    });

    if (response.status !== 204) {
        throw new Error(
            `Não foi possível terminar a sessão. HTTP ${response.status}`
        );
    }
}




export const authService = {
    getCsrfToken,
    login,
    changePassword,
    getAuthenticatedUser,
    logout
};


