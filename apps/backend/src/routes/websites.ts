import { zValidator } from "@hono/zod-validator";
import {
    CREATE_WEBSITE_SCHEMA,
    UPDATE_WEBSITE_SCHEMA
} from "@open-voices/validation/website-schemas";
import { Hono } from "hono";
import z from "zod/v4";
import {
    BAD_REQUEST, CREATED, NOT_FOUND,
    OK
} from "../lib/const";
import { PRISMA } from "../lib/prisma";
import { ACL } from "../middlewares/acl";
import type { HonoEnv } from "../types/hono";

export const WEBSITES = new Hono<HonoEnv>()
    .basePath(`websites`)

// Create a new website
    .post(
        `/`,
        ACL({
            website: [ `create` ],
        }),
        zValidator(`json`, CREATE_WEBSITE_SCHEMA),
        async(c) => {
            const data = c.req.valid(`json`);

            if (
                await PRISMA.website.exists({
                    url: data.url,
                })
            ) {
                return c.json(
                    {
                        error: `Website with this URL already exists`,
                    },
                    BAD_REQUEST
                );
            }

            if (
                await PRISMA.website.exists({
                    name: data.name,
                })
            ) {
                return c.json(
                    {
                        error: `Website with this name already exists`,
                    },
                    BAD_REQUEST
                );
            }

            const website = await PRISMA.website.create({
                data: {
                    name:                  data.name,
                    url:                   data.url,
                    description:           data.description,
                    page_identifier_rules: data.page_identifier_rules,
                },
            });

            return c.json(
                {
                    id:                    website.id,
                    name:                  website.name,
                    url:                   website.url,
                    description:           website.description,
                    page_identifier_rules: website.page_identifier_rules,
                },
                CREATED
            );
        }
    )

// Get all websites
    .get(
        `/`,
        ACL({
            website: [ `list` ],
        }),
        async(c) => {
            const websites = await PRISMA.website.findMany({
                orderBy: {
                    name: `asc`,
                },
            });

            return c.json(
                websites.map((website) => ({
                    id:                    website.id,
                    name:                  website.name,
                    url:                   website.url,
                    description:           website.description,
                    page_identifier_rules: website.page_identifier_rules,
                })),
                OK
            );
        }
    )

// Get a website by ID
    .get(
        `/:id`,
        ACL({
            website: [ `read` ],
        }),
        zValidator(
            `param`,
            z.object({
                id: z.cuid2(`Invalid website ID format`),
            })
        ),
        async(c) => {
            const {
                id,
            } = c.req.valid(`param`);

            const website = await PRISMA.website.findUnique({
                where: {
                    id,
                },
            });

            if (!website) {
                return c.json(
                    {
                        error: `Website not found`,
                    },
                    NOT_FOUND
                );
            }

            return c.json(
                {
                    id:                    website.id,
                    name:                  website.name,
                    url:                   website.url,
                    description:           website.description,
                    page_identifier_rules: website.page_identifier_rules,
                },
                OK
            );
        }
    )

// Update a website by ID
    .put(
        `/:id`,
        ACL({
            website: [ `update` ],
        }),
        zValidator(
            `param`,
            z.object({
                id: z.cuid2(`Invalid website ID format`),
            })
        ),
        zValidator(`json`, UPDATE_WEBSITE_SCHEMA),
        async(c) => {
            const {
                id,
            } = c.req.valid(`param`);
            const data = c.req.valid(`json`);

            const website = await PRISMA.website.findUnique({
                where: {
                    id,
                },
            });

            if (!website) {
                return c.json(
                    {
                        error: `Website not found`,
                    },
                    NOT_FOUND
                );
            }

            if (
                data.url &&
                (await PRISMA.website.exists({
                    url: data.url,
                    NOT: {
                        id,
                    },
                }))
            ) {
                return c.json(
                    {
                        error: `Website with this URL already exists`,
                    },
                    BAD_REQUEST
                );
            }

            if (
                data.name &&
                (await PRISMA.website.exists({
                    name: data.name,
                    NOT:  {
                        id,
                    },
                }))
            ) {
                return c.json(
                    {
                        error: `Website with this name already exists`,
                    },
                    BAD_REQUEST
                );
            }

            const updated_website = await PRISMA.website.update({
                where: {
                    id,
                },
                data,
            });

            return c.json(
                {
                    id:                    updated_website.id,
                    name:                  updated_website.name,
                    url:                   updated_website.url,
                    description:           updated_website.description,
                    page_identifier_rules: updated_website.page_identifier_rules,
                },
                OK
            );
        }
    )

// Delete a website by ID
    .delete(
        `/:id`,
        ACL({
            website: [ `delete` ],
        }),
        zValidator(
            `param`,
            z.object({
                id: z.cuid2(`Invalid website ID format`),
            })
        ),
        async(c) => {
            const {
                id,
            } = c.req.valid(`param`);

            const website = await PRISMA.website.findUnique({
                where: {
                    id,
                },
            });

            if (!website) {
                return c.json(
                    {
                        error: `Website not found`,
                    },
                    NOT_FOUND
                );
            }

            await PRISMA.website.delete({
                where: {
                    id,
                },
            });

            return c.json(
                {
                    message: `Website deleted successfully`,
                },
                OK
            );
        }
    );
