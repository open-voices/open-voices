import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";

export const AUTH_CLIENT = createAuthClient({
    basePath:     process.env.AUTH_BASE_URL ?? `http://localhost:3000/`,
    fetchOptions: {
        onSuccess: (ctx) => {
            const auth_token = ctx.response.headers.get(`set-auth-jwt`);

            if (auth_token) {
                localStorage.setItem(`open_voices_token`, auth_token);
            }
        },
        auth: {
            type:  `Bearer`,
            token: getAuthToken,
        },
    },
    plugins: [
        adminClient(),
    ]
});

/**
 * Retrieves the current authentication token from localStorage.
 * @returns The current authentication token from localStorage or an empty string if not found.
 */
export function getAuthToken(): string {
    return localStorage.getItem(`open_voices_token`) ?? ``;
}
