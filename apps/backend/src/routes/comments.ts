import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
    BAD_REQUEST, CREATED,  NOT_FOUND
} from "../lib/const.ts";
import { formatUrlMatch } from "../lib/glob-match.ts";
import { PRISMA } from "../lib/prisma.ts";
import { ACL } from "../middlewares/acl.ts";
import { withFeatures } from "../middlewares/with-features.ts";
import type { HonoEnv } from "../types/hono.ts";
import {
    ADMIN_DELETE_COMMENT_SCHEMA_PARAMS, ADMIN_GET_WEBSITE_COMMENTS_SCHEMA_PARAMS,
    ADMIN_GET_WEBSITE_COMMENTS_SCHEMA_QUERY, ADMIN_UPDATE_COMMENT_SCHEMA,
    ADMIN_UPDATE_COMMENT_SCHEMA_PARAMS, CREATE_COMMENT_SCHEMA, CREATE_COMMENT_SCHEMA_PARAMS,
    DELETE_COMMENT_SCHEMA_PARAMS, GET_WEBSITE_COMMENTS_SCHEMA_PARAMS, GET_WEBSITE_COMMENTS_SCHEMA_QUERY,
    INTERACT_COMMENT_SCHEMA, INTERACT_COMMENT_SCHEMA_PARAMS, UPDATE_COMMENT_SCHEMA, UPDATE_COMMENT_SCHEMA_PARAMS
} from "@open-voices/validation/comment-schemas";

export const COMMENTS = new Hono<HonoEnv>()
    .basePath(`comments`)

    // Create a new comment
    .post(
        `/:website_id`,
        ACL({
            comments:  [ `create` ],
            is_banned: false,
        }),
        withFeatures([ `ALLOW_NEW_COMMENTS` ]),
        zValidator(
            `param`,
            CREATE_COMMENT_SCHEMA_PARAMS
        ),
        zValidator(
            `json`,
            CREATE_COMMENT_SCHEMA
        ),
        async(c) => {
            const {
                website_id,
            } = c.req.valid(`param`);
            const data = c.req.valid(`json`);

            const website = await PRISMA.website.findUnique({
                where: {
                    id: website_id,
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

            const page_identifier = formatUrlMatch(website, data.url);
            if (!page_identifier) {
                return c.json(
                    {
                        error: `Page URL does not match any identifier rules for this website`,
                    },
                    BAD_REQUEST
                );
            }

            const comment = await PRISMA.comment.create({
                data: {
                    page_identifier,
                    content:   data.content,
                    website_id,
                    author_id: c.get(`user`)!.id,
                },
            });

            return c.json(
                {
                    id:      comment.id,
                    page_identifier,
                    content: comment.content,
                },
                CREATED
            );
        }
    )

    // Get comments for a specific website and page identifier
    // NOTE: This endpoint is public and does not require authentication
    .get(
        `/:website_id/:url`,
        zValidator(
            `param`,
            GET_WEBSITE_COMMENTS_SCHEMA_PARAMS
        ),
        zValidator(
            `query`,
            GET_WEBSITE_COMMENTS_SCHEMA_QUERY
        ),
        async(c) => {
            const {
                website_id,
                url,
            } = c.req.valid(`param`);
            const {
                page,
                limit,
            } = c.req.valid(`query`);

            const website = await PRISMA.website.findUnique({
                where: {
                    id: website_id,
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

            const page_identifier = formatUrlMatch(website, url);
            if (!page_identifier) {
                return c.json(
                    {
                        error: `Page URL does not match any identifier rules for this website`,
                    },
                    BAD_REQUEST
                );
            }

            const comments = await PRISMA.comment.findMany({
                where: {
                    website_id,
                    page_identifier,
                    author: {
                        OR: [
                            {
                                banned: null,
                            },
                            {
                                banned: false,
                            },
                        ],
                    },
                },
                include: {
                    author: {
                        select: {
                            id:   true,
                            name: true,
                        },
                    },
                },
                orderBy: {
                    created_at: `desc`,
                },
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                skip: (page - 1) * limit,
                take: limit,
            });

            return c.json(
                comments.map((comment) => ({
                    id:              comment.id,
                    page_identifier: comment.page_identifier,
                    content:         comment.content,
                    created_at:      comment.created_at,
                    author:          comment.author,
                }))
            );
        }
    )

    // Update a comment by ID if the user is the author of the comment
    .put(
        `/:website_id/:comment_id`,
        ACL({
            comments:  [ `update` ],
            is_banned: false,
        }),
        withFeatures([ `ALLOW_COMMENT_UPDATES` ]),
        zValidator(
            `param`,
            UPDATE_COMMENT_SCHEMA_PARAMS
        ),
        zValidator(
            `json`,
            UPDATE_COMMENT_SCHEMA
        ),
        async(c) => {
            const {
                website_id,
                comment_id,
            } = c.req.valid(`param`);
            const data = c.req.valid(`json`);

            const website = await PRISMA.website.findUnique({
                where: {
                    id: website_id,
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

            try {
                const comment = await PRISMA.comment.update({
                    where: {
                        id:        comment_id,
                        author_id: c.get(`user`)!.id,
                        website_id,
                    },
                    data:  {
                        content: data.content,
                    },
                });

                return c.json(
                    {
                        id:      comment.id,
                        content: comment.content,
                    }
                );
            }
            catch (_err) {
                return c.json(
                    {
                        error: `Comment not found or you are not the author of this comment`,
                    },
                    NOT_FOUND
                );
            }
        }
    )

    // Delete a comment by ID if the user is the author of the comment
    .delete(
        `/:website_id/:comment_id`,
        ACL({
            comments:  [ `delete` ],
            is_banned: false,
        }),
        withFeatures([ `ALLOW_COMMENT_DELETION` ]),
        zValidator(
            `param`,
            DELETE_COMMENT_SCHEMA_PARAMS
        ),
        async(c) => {
            const {
                website_id,
                comment_id,
            } = c.req.valid(`param`);

            const website = await PRISMA.website.findUnique({
                where: {
                    id: website_id,
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

            try {
                const comment = await PRISMA.comment.delete({
                    where: {
                        id:        comment_id,
                        author_id: c.get(`user`)!.id,
                        website_id,
                    },
                });

                return c.json(
                    {
                        id:      comment.id,
                        message: `Comment deleted successfully`,
                    }
                );
            }
            catch (_err) {
                return c.json(
                    {
                        error: `Comment not found or you are not the author of this comment`,
                    },
                    NOT_FOUND
                );
            }
        }
    )

    // Register an interaction with a comment not owned by the user,
    // one interaction per comment per user is allowed
    .put(
        `/:website_id/:comment_id/interact`,
        ACL({
            comments:  [ `interact` ],
            is_banned: false,
        }),
        withFeatures([ `ALLOW_COMMENT_INTERACTIONS` ]),
        zValidator(
            `param`,
            INTERACT_COMMENT_SCHEMA_PARAMS
        ),
        zValidator(
            `json`,
            INTERACT_COMMENT_SCHEMA
        ),
        async(c) => {
            const {
                website_id,
                comment_id,
            } = c.req.valid(`param`);
            const {
                type,
            } = c.req.valid(`json`);

            const website = await PRISMA.website.findUnique({
                where: {
                    id: website_id,
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

            await PRISMA.commentInteraction.upsert({
                where: {
                    comment_id_user_id: {
                        user_id: c.get(`user`)!.id,
                        comment_id,
                    },
                },
                create: {
                    user_id:   c.get(`user`)!.id,
                    comment_id,
                    type,
                },
                update: {
                    type,
                },
            });

            return c.json(
                {
                    message: `Interaction recorded successfully`,
                }
            );
        }
    )

    // Get comments for a specific website
    .get(
        `/admin/:website_id`,
        ACL({
            comments: [ `admin.list` ],
        }),
        zValidator(
            `param`,
            ADMIN_GET_WEBSITE_COMMENTS_SCHEMA_PARAMS
        ),
        zValidator(
            `query`,
            ADMIN_GET_WEBSITE_COMMENTS_SCHEMA_QUERY
        ),
        async(c) => {
            const {
                website_id,
            } = c.req.valid(`param`);
            const {
                page,
                limit,
                includes,
            } = c.req.valid(`query`);

            const website = await PRISMA.website.findUnique({
                where: {
                    id: website_id,
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

            const comments = await PRISMA.comment.findMany({
                where: {
                    website_id,

                    // If includes contains "banned", includes banned authors
                    ...(
                        includes?.includes(`banned`)
                        ? {}
                        : {
                            author: {
                                OR: [
                                    {
                                        banned: null,
                                    },
                                    {
                                        banned: false,
                                    },
                                ],
                            },
                        }
                    ),
                },
                include: {
                    author: {
                        select: {
                            id:   true,
                            name: true,
                        },
                    },
                    interactions: {
                        select: {
                            type:    true,
                            user_id: true,
                        },
                    },
                },
                orderBy: {
                    created_at: `desc`,
                },
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                skip: (page - 1) * limit,
                take: limit,
            });

            return c.json(
                comments.map((comment) => ({
                    id:              comment.id,
                    page_identifier: comment.page_identifier,
                    content:         comment.content,
                    created_at:      comment.created_at,
                    author:          comment.author,
                }))
            );
        }
    )

    // Delete a comment by ID
    .delete(
        `/admin/:website_id/:comment_id`,
        ACL({
            comments: [ `admin.delete` ],
        }),
        zValidator(
            `param`,
            ADMIN_DELETE_COMMENT_SCHEMA_PARAMS
        ),
        async(c) => {
            const {
                website_id,
                comment_id,
            } = c.req.valid(`param`);

            const website = await PRISMA.website.findUnique({
                where: {
                    id: website_id,
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

            const comment = await PRISMA.comment.delete({
                where: {
                    id: comment_id,
                    website_id,
                },
            });

            return c.json(
                {
                    id:      comment.id,
                    message: `Comment deleted successfully`,
                }
            );
        }
    )

    // Update a comment by ID
    .put(
        `/admin/:website_id/:comment_id`,
        ACL({
            comments: [ `admin.update` ],
        }),
        zValidator(
            `param`,
            ADMIN_UPDATE_COMMENT_SCHEMA_PARAMS
        ),
        zValidator(
            `json`,
            ADMIN_UPDATE_COMMENT_SCHEMA
        ),
        async(c) => {
            const {
                website_id,
                comment_id,
            } = c.req.valid(`param`);
            const data = c.req.valid(`json`);

            const website = await PRISMA.website.findUnique({
                where: {
                    id: website_id,
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

            const comment = await PRISMA.comment.update({
                where: {
                    id: comment_id,
                    website_id,
                },
                data: {
                    content: data.content,
                },
            });

            return c.json(
                {
                    id:      comment.id,
                    content: comment.content,
                }
            );
        }
    );
