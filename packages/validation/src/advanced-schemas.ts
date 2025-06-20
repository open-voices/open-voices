/* v8 ignore start */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import z from "zod/v4";

export const BASE_SORTING_SCHEMA = z.object({
    by:        z.string(),
    direction: z.union([
        z.literal(`asc`),
        z.literal(`desc`),
    ]).optional()
        .default(`asc`),
});

export const BASE_FILTER_SCHEMA = z.object({
    by:    z.string(),
});

export const FILTER_SCHEMA = z.discriminatedUnion(`type`, [
    z.object({
        ...BASE_FILTER_SCHEMA.shape,
        value:    z.coerce.string(),
        type:     z.literal(`string`),
        mode:  z.union([
            z.literal(`insensitive`),
            z.literal(`sensitive`),
        ]).optional()
            .default(`sensitive`),
        relation: z.union([
            // base string relations
            z.literal(`equals`),
            z.literal(`contains`),
            z.literal(`starts_with`),
            z.literal(`ends_with`),
            z.literal(`in`),

            // negated relations
            z.literal(`not_equals`),
            z.literal(`not_contains`),
            z.literal(`not_starts_with`),
            z.literal(`not_ends_with`),
            z.literal(`not_in`),
        ]).optional()
            .default(`equals`),
    }),
    z.object({
        ...BASE_FILTER_SCHEMA.shape,
        value:    z.string().transform((val) => val.trim()
            .split(`,`)
            .map((v) => v.trim())
            .map((v) => Number(v))
            .filter((v) => !Number.isNaN(v))
        ),
        type:     z.literal(`number`),
        relation: z.union([
            // base number relations
            z.literal(`equals`),
            z.literal(`lt`),
            z.literal(`lte`),
            z.literal(`gt`),
            z.literal(`gte`),
            z.literal(`in`),

            // negated relations
            z.literal(`not_equals`),
            z.literal(`not_lt`),
            z.literal(`not_lte`),
            z.literal(`not_gt`),
            z.literal(`not_gte`),
            z.literal(`not_in`),
        ]).optional()
            .default(`equals`),
    }),
    z.object({
        ...BASE_FILTER_SCHEMA.shape,
        value:    z.coerce.boolean(),
        type:     z.literal(`boolean`),
        relation: z.literal(`equals`).optional()
            .default(`equals`),
    }),
    z.object({
        ...BASE_FILTER_SCHEMA.shape,
        value:    z.coerce.date(),
        type:     z.literal(`date`),
        relation: z.union([
            // base date relations
            z.literal(`equals`),
            z.literal(`lt`),
            z.literal(`lte`),
            z.literal(`gt`),
            z.literal(`gte`),

            // negated relations
            z.literal(`not_equals`),
            z.literal(`not_lt`),
            z.literal(`not_lte`),
            z.literal(`not_gt`),
            z.literal(`not_gte`),
        ]).optional()
            .default(`equals`),
    }),
]);

export const ADVANCED_QUERY_SCHEMA = z.object({
    page: z.coerce.number()
        .int()
        .min(1)
        .optional()
        .default(1),
    limit: z.coerce.number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .default(10),
    sort:    z.union([
        BASE_SORTING_SCHEMA,
        z.string()
            .transform((val) => {
                try {
                    val = decodeURIComponent(val);
                    return JSON.parse(val) as z.infer<typeof BASE_SORTING_SCHEMA>;
                }
                catch {
                    return undefined;
                }
            })
            .refine((val) => val === undefined || BASE_SORTING_SCHEMA.safeParse(val).success, {
                message: `Invalid sort format`,
            }),
    ]).optional(),
    filters: z.union([
        z.array(FILTER_SCHEMA)
            .default([]),
        z.string()
            .transform((val) => {
                try {
                    val = decodeURIComponent(val);
                    return JSON.parse(val) as Array<z.infer<typeof FILTER_SCHEMA>>;
                }
                catch {
                    return [];
                }
            })
            .refine((val) => Array.isArray(val) && val.every((v) => FILTER_SCHEMA.safeParse(v).success), {
                message: `Invalid filters format`,
            }),
    ])
        .default([])
        .optional(),
});

/* v8 ignore stop */
