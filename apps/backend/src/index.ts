import { Hono } from "hono";
import { PRISMA } from "./lib/prisma";
import { makeAuthConfig } from "@open-voices/shared/auth/server";

const APP = new Hono();

APP.get(`/`, (c) => c.text(`Hello Hono!`));
APP.on([
    `POST`,
    `GET`,
], `/api/auth/**`, (c) => makeAuthConfig(PRISMA).handler(c.req.raw));


export default {
    port:  3000,
    fetch: APP.fetch,
};
