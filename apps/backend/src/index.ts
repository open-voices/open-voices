import { Hono } from "hono";
import {
    renderMail, sendMail
} from "./lib/mailer.ts";
import { PRISMA } from "./lib/prisma";
import { makeAuthConfig } from "@open-voices/shared/auth/server";

const APP = new Hono();

APP.get(`/`, (c) => c.text(`Hello Hono!`));
APP.on([
    `POST`,
    `GET`,
], `/api/auth/**`, async(c) => await makeAuthConfig({
    prisma: PRISMA,
    sendMail,
    renderMail,
}).handler(c.req.raw));


export default {
    port:  3000,
    fetch: APP.fetch,
};
