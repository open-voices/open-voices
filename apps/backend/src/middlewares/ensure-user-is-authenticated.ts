import { HTTPException } from "hono/http-exception";
import { createMiddleware } from "hono/factory";
import type { HonoEnv } from "../types/hono.ts";

export const ensureUserIsAuthenticated = createMiddleware<HonoEnv>(async(c, next) => {
    const user = c.get(`user`);
    const session = c.get(`session`);

    if (!user || !session) {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        throw new HTTPException(401, {
            message: `Authentication required`,
        });
    }

    return await next();
});
