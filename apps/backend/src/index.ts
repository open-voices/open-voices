/* v8 ignore start */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth.ts";
import { ensureUserIsAuthenticated } from "./middlewares/ensure-user-is-authenticated.ts";
import { registerUserAndSession } from "./middlewares/register-user-and-session.ts";
import { COMMENTS } from "./routes/comments.ts";
import { WEBSITES } from "./routes/websites.ts";
import { setup } from "./setup.ts";
import type { HonoEnv } from "./types/hono.ts";
import { HTTPException } from "hono/http-exception";
import {
    INTERNAL_SERVER_ERROR, NOT_FOUND
} from "./lib/const.ts";

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
    .notFound((c) => c.json({
        message: `Resource not found. Please check the URL and try again.`,
    }, NOT_FOUND))
    .onError((err, c) => {
        console.error(`Error in Hono app:`, err);

        if (err instanceof HTTPException) {
            return err.getResponse();
        }

        return c.json(
            {
                message: `Something went wrong, please try again later.`,
            },
            INTERNAL_SERVER_ERROR
        );
    })
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
    .route(`/`, WEBSITES)
    .route(`/`, COMMENTS);

export default {
    port:  3000,
    fetch: APP.fetch,
};

/* v8 ignore stop */
