import { createMiddleware } from "hono/factory";
import { auth } from "../lib/auth.ts";
import type { HonoEnv } from "../types/hono.ts";

/**
 * Middleware to register the user and session in the context.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const registerUserAndSession = createMiddleware<HonoEnv>(async(c, next) => {
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    });

    if (!session) {
        c.set(`user`, null);
        c.set(`session`, null);
        return next();
    }

    c.set(`user`, session.user);
    c.set(`session`, session.session);
    return next();
});
