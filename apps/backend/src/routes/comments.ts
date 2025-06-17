import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod/v4";
import {
    BAD_REQUEST, CREATED,  NOT_FOUND
} from "../lib/const.ts";
import { PRISMA } from "../lib/prisma.ts";
import { userHasPermission } from "../middlewares/user-has-permission.ts";
import type { HonoEnv } from "../types/hono.ts";

const CREATE_UPDATE_WEBSITE_SCHEMA = z.object({
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    name:                  z.string().min(5, `Name must be at least 5 characters long`),
    url:                   z.url(`Invalid URL format`),
    description:           z.string().optional(),
    page_identifier_rules: z.array(
        z.object({
            url:    z.url(`Invalid URL format`),
            format: z.string().regex(

                // Allows a format that can contain placeholders like:
                // - {title($1)}
                // - {dash($1)}
                // - {snake($1)}
                // - {$1}
                // - static text like "Page Title"
                // - alphanumeric characters, dashes, underscores, and spaces
                // - or a combination of these
                //
                // Valid examples:
                // - {title($1)}
                // - {dash($1)}
                // - {snake($1)}
                // - {title($1)} {dash($2)}
                // - {title($1)} {snake($2)}
                // - {title($1)} static {dash($2)} text {snake($3)}
                // - {$1}
                // - static text
                //
                // Invalid examples:
                // - missing closing brace: {title($1) {dash($2)}
                // - invalid characters: {title($1)} {dash($2)} @invalid
                // - empty format: {}
                // - only spaces: {   }
                // - no placeholders or static text: {title} {dash} {snake}
                // - invalid transformation: {rambo($1)}
                /^(?:\{(?:title|dash|snake)\(\$\d+\)}|[A-Za-z0-9\-_ ]+|\{\$\d+})+$/g,
                `Format must be a valid string with placeholders or static text`
            )
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                .min(1, `Format must not be empty`),
        })
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    ).min(1, `At least one page identifier rule is required`),
});

export const WEBSITES = new Hono<HonoEnv>()
    .basePath(`websites`)

    // Create a new website
    .post(
        ``,
        userHasPermission({
            website: [ `create` ],
        }),
        zValidator(
            `json`,
            CREATE_UPDATE_WEBSITE_SCHEMA
        ),
        async(c) => {
            const data = c.req.valid(`json`);

            if (await PRISMA.website.exists({
                url: data.url,
            })) {
                return c.json(
                    {
                        error: `Website with this URL already exists`,
                    },
                    BAD_REQUEST
                );
            }

            if (await PRISMA.website.exists({
                name: data.name,
            })) {
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
        ``,
        userHasPermission({
            website: [ `list` ],
        }),
        async(c) => {
            const websites = await PRISMA.website.findMany({
                orderBy: {
                    name: `asc`,
                },
            });

            return c.json(
                websites.map((website) => (
                    {
                        id:                    website.id,
                        name:                  website.name,
                        url:                   website.url,
                        description:           website.description,
                        page_identifier_rules: website.page_identifier_rules,
                    }
                ))
            );
        }
    )

    // Get a website by ID
    .get(
        `/:id`,
        userHasPermission({
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

            return c.json({
                id:                    website.id,
                name:                  website.name,
                url:                   website.url,
                description:           website.description,
                page_identifier_rules: website.page_identifier_rules,
            });
        }
    )

    // Update a website by ID
    .put(
        `/:id`,
        userHasPermission({
            website: [ `update` ],
        }),
        zValidator(
            `param`,
            z.object({
                id: z.cuid2(`Invalid website ID format`),
            })
        ),
        zValidator(
            `json`,
            CREATE_UPDATE_WEBSITE_SCHEMA
        ),
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

            if (data.url && await PRISMA.website.exists({
                url: data.url,
                NOT: {
                    id,
                },
            })) {
                return c.json(
                    {
                        error: `Website with this URL already exists`,
                    },
                    BAD_REQUEST
                );
            }

            if (data.name && await PRISMA.website.exists({
                name: data.name,
                NOT:  {
                    id,
                },
            })) {
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

            return c.json({
                id:                    updated_website.id,
                name:                  updated_website.name,
                url:                   updated_website.url,
                description:           updated_website.description,
                page_identifier_rules: updated_website.page_identifier_rules,
            });
        }
    )

    // Delete a website by ID
    .delete(
        `/:id`,
        userHasPermission({
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
                }
            );
        }
    );

