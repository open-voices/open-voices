import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth.ts";
import { setup } from "./setup.ts";

await setup();

const APP = new Hono();

APP.use(logger());
APP.use(
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
        origin:        process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(`,`) : [ `http://localhost:5173` ],
    })
);

APP.get(`/`, (c) => c.text(`Hello Hono!`));
APP.on([
    `POST`,
    `GET`,
], `/api/auth/**`, async(c) => await auth.handler(c.req.raw));


export default {
    port:  3000,
    fetch: APP.fetch,
};
