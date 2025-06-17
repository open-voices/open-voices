import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth.ts";
import { ensureUserIsAuthenticated } from "./middlewares/ensure-user-is-authenticated.ts";
import { registerUserAndSession } from "./middlewares/register-user-and-session.ts";
import { WEBSITES } from "./routes/websites.ts";
import { setup } from "./setup.ts";
import type { HonoEnv } from "./types/hono.ts";

await setup();

const APP = new Hono<HonoEnv>()
    .basePath(`api`)
    .use(logger())
    .use(
        `*`,
        cors({
            credentials:   true,
            allowMethods:  [
                `GET`,
                `POST`,
                `PUT`,
                `DELETE`,
                `OPTIONS`,
            ],
            allowHeaders: [
                `Content-Type`,
                `Authorization`,
            ],
            exposeHeaders: [ `Content-Length` ],
            origin:        process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(`,`) : [ `http://localhost:5173` ],
        })
    )
    .use(
        `*`,
        registerUserAndSession
    )
    .on(
        [
            `POST`,
            `GET`,
        ],
        `/auth/**`,
        async(c) => await auth.handler(c.req.raw)
    )
    .use(
        `*`,
        ensureUserIsAuthenticated
    )
    .route(`/`, WEBSITES);

export default {
    port:  3000,
    fetch: APP.fetch,
};
