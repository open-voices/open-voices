import { HTTPException } from "hono/http-exception";
import { createMiddleware } from "hono/factory";
import type { HonoEnv } from "../types/hono.ts";

/**
 * Middleware to ensure the user is authenticated.
 * If the user is not authenticated, it throws a 401 Unauthorized error.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ensureUserIsAuthenticated = createMiddleware<HonoEnv>(async(c, next) => {
    const user = c.get(`user`);
    const session = c.get(`session`);

    const url = new URL(c.req.url).pathname;

    if ((!user || !session) && (!url.startsWith(`/api/auth/`))) {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        throw new HTTPException(401, {
            message: `Authentication required`,
        });
    }

    return await next();
});
