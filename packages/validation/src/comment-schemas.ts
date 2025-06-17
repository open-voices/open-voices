/* eslint-disable @typescript-eslint/no-magic-numbers */
import z from "zod/v4";

export const CREATE_COMMENT_SCHEMA_PARAMS = z.object({
    website_id: z.cuid2(`Invalid website ID format`),
});

export const CREATE_COMMENT_SCHEMA = z.object({
    url:     z.url().min(1, `Page URL is required`),
    content: z.string().min(1, `Content is required`),
});

export const GET_WEBSITE_COMMENTS_SCHEMA_PARAMS = z.object({
    website_id:     z.cuid2(`Invalid website ID format`),
    url:        z.url().min(1, `Page URL is required`),
});

export const GET_WEBSITE_COMMENTS_SCHEMA_QUERY = z.object({
    page:  z.coerce.number().int()
        .min(1)
        .default(1),
    limit: z.coerce.number().int()
        .min(1)
        .max(100)
        .default(10),
});

export const UPDATE_COMMENT_SCHEMA_PARAMS = z.object({
    website_id: z.cuid2(`Invalid website ID format`),
    comment_id: z.cuid2(`Invalid comment ID format`),
});

export const UPDATE_COMMENT_SCHEMA = z.object({
    content: z.string().min(1, `Content is required`),
});

export const DELETE_COMMENT_SCHEMA_PARAMS = z.object({
    website_id: z.cuid2(`Invalid website ID format`),
    comment_id: z.cuid2(`Invalid comment ID format`),
});

export const INTERACT_COMMENT_SCHEMA_PARAMS = z.object({
    website_id: z.cuid2(`Invalid website ID format`),
    comment_id: z.cuid2(`Invalid comment ID format`),
});

export const INTERACT_COMMENT_SCHEMA = z.object({
    type: z.enum([
        `LIKE`,
        `DISLIKE`,
        `REPORT`,
    ], `Interaction type is required`),
});

export const ADMIN_GET_WEBSITE_COMMENTS_SCHEMA_PARAMS = z.object({
    website_id: z.cuid2(`Invalid website ID format`),
});

export const ADMIN_GET_WEBSITE_COMMENTS_SCHEMA_QUERY = z.object({
    page:     z.coerce.number().int()
        .min(1)
        .default(1),
    limit:    z.coerce.number().int()
        .min(1)
        .max(100)
        .default(10),
    includes: z.string().transform((val) => val.split(`,`).map((v) => v.trim()))
        .pipe(z.array(z.enum([ `banned` ])))
        .optional(),
});

export const ADMIN_DELETE_COMMENT_SCHEMA_PARAMS = z.object({
    website_id: z.cuid2(`Invalid website ID format`),
    comment_id: z.cuid2(`Invalid comment ID format`),
});

export const ADMIN_UPDATE_COMMENT_SCHEMA_PARAMS = z.object({
    website_id: z.cuid2(`Invalid website ID format`),
    comment_id: z.cuid2(`Invalid comment ID format`),
});

export const ADMIN_UPDATE_COMMENT_SCHEMA = z.object({
    content: z.string().min(1, `Content is required`),
});
