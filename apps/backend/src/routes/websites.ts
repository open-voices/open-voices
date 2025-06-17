import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { HonoEnv } from "../types/hono.ts";
import z from "zod/v4";

export const WEBSITES = new Hono<HonoEnv>()
    .basePath(`websites`)
    .post(
        ``,
        zValidator(
            `json`,
            z.object({
                body: z.string(),
            })
        ),
        async(c) => {

        }
    );

