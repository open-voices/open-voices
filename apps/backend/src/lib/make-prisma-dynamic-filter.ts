import type { ADVANCED_QUERY_SCHEMA } from "@open-voices/validation/advanced-schemas";
import { HTTPException } from "hono/http-exception";
import type z from "zod/v4";
import { BAD_REQUEST } from "./const";

export function makePrismaDynamicFilter<
    I extends Record<string, unknown> & {
        AND?: unknown
        OR?:  unknown
        NOT?: unknown
    },
    C extends Exclude<keyof I, `AND` | `OR` | `NOT`> = Exclude<keyof I, `AND` | `OR` | `NOT`>,
    Cn extends Array<C> = Array<C>
>(
    filters: z.infer<typeof ADVANCED_QUERY_SCHEMA>[`filters`],
    columns: Cn
): Partial<I> {
    return !filters
    ? {}
    : filters.reduce((acc, filter) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!columns.includes(filter.by as any)) {
            return acc;
        }

        switch (filter.type) {
            case `string`: {
                switch (filter.relation) {
                    case `equals`:
                        acc[filter.by as keyof I] = {
                            equals: filter.value,
                            mode:   filter.mode === `sensitive` ? undefined : `insensitive`,
                        } as I[keyof I];
                        break;
                    case `not_equals`:
                        acc[filter.by as keyof I] = {
                            not: {
                                equals: filter.value,
                            },
                            mode:       filter.mode === `sensitive` ? undefined : `insensitive`,
                        } as I[keyof I];
                        break;
                    case `contains`:
                        acc[filter.by as keyof I] = {
                            contains: filter.value,
                            mode:     filter.mode === `sensitive` ? undefined : `insensitive`,
                        } as I[keyof I];
                        break;
                    case `not_contains`:
                        acc[filter.by as keyof I] = {
                            not: {
                                contains: filter.value,
                            },
                            mode:       filter.mode === `sensitive` ? undefined : `insensitive`,
                        } as I[keyof I];
                        break;
                    case `starts_with`:
                        acc[filter.by as keyof I] = {
                            startsWith: filter.value,
                            mode:       filter.mode === `sensitive` ? undefined : `insensitive`,
                        } as I[keyof I];
                        break;
                    case `not_starts_with`:
                        acc[filter.by as keyof I] = {
                            not: {
                                startsWith: filter.value,
                            },
                            mode:       filter.mode === `sensitive` ? undefined : `insensitive`,
                        } as I[keyof I];
                        break;
                    case `ends_with`:
                        acc[filter.by as keyof I] = {
                            endsWith: filter.value,
                            mode:     filter.mode === `sensitive` ? undefined : `insensitive`,
                        } as I[keyof I];
                        break;
                    case `not_ends_with`:
                        acc[filter.by as keyof I] = {
                            not: {
                                endsWith: filter.value,
                            },
                            mode:       filter.mode === `sensitive` ? undefined : `insensitive`,
                        } as I[keyof I];
                        break;
                    case `in`:
                        acc[filter.by as keyof I] = {
                            in:   filter.value.split(`,`),
                            mode: filter.mode === `sensitive` ? undefined : `insensitive`,
                        } as I[keyof I];
                        break;
                    case `not_in`:
                        acc[filter.by as keyof I] = {
                            notIn: filter.value.split(`,`),
                            mode:  filter.mode === `sensitive` ? undefined : `insensitive`,
                        } as I[keyof I];
                        break;
                }
                break;
            }
            case `number`: {
                switch (filter.relation) {
                    case `equals`:
                        acc[filter.by as keyof I] = {
                            equals: filter.value[0],
                        } as I[keyof I];
                        break;
                    case `not_equals`:
                        acc[filter.by as keyof I] = {
                            not: {
                                equals: filter.value[0],
                            },
                        } as I[keyof I];
                        break;
                    case `lt`:
                        acc[filter.by as keyof I] = {
                            lt: filter.value[0],
                        } as I[keyof I];
                        break;
                    case `not_lt`:
                        acc[filter.by as keyof I] = {
                            not: {
                                lt: filter.value[0],
                            },
                        } as I[keyof I];
                        break;
                    case `lte`:
                        acc[filter.by as keyof I] = {
                            lte: filter.value[0],
                        } as I[keyof I];
                        break;
                    case `not_lte`:
                        acc[filter.by as keyof I] = {
                            not: {
                                lte: filter.value[0],
                            },
                        } as I[keyof I];
                        break;
                    case `gt`:
                        acc[filter.by as keyof I] = {
                            gt: filter.value[0],
                        } as I[keyof I];
                        break;
                    case `not_gt`:
                        acc[filter.by as keyof I] = {
                            not: {
                                gt: filter.value[0],
                            },
                        } as I[keyof I];
                        break;
                    case `gte`:
                        acc[filter.by as keyof I] = {
                            gte: filter.value[0],
                        } as I[keyof I];
                        break;
                    case `not_gte`:
                        acc[filter.by as keyof I] = {
                            not: {
                                gte: filter.value[0],
                            },
                        } as I[keyof I];
                        break;
                    case `in`:
                        acc[filter.by as keyof I] = {
                            in: filter.value,
                        } as I[keyof I];
                        break;
                    case `not_in`:
                        acc[filter.by as keyof I] = {
                            notIn: filter.value,
                        } as I[keyof I];
                        break;
                }
                break;
            }
            case `boolean`:
                acc[filter.by as keyof I] = {
                    equals: filter.value,
                } as I[keyof I];
                break;
            case `date`: {
                switch (filter.relation) {
                    case `equals`:
                        acc[filter.by as keyof I] = {
                            equals: filter.value,
                        } as I[keyof I];
                        break;
                    case `not_equals`:
                        acc[filter.by as keyof I] = {
                            not: {
                                equals: filter.value,
                            },
                        } as I[keyof I];
                        break;
                    case `lt`:
                        acc[filter.by as keyof I] = {
                            lt: filter.value,
                        } as I[keyof I];
                        break;
                    case `not_lt`:
                        acc[filter.by as keyof I] = {
                            not: {
                                lt: filter.value,
                            },
                        } as I[keyof I];
                        break;
                    case `lte`:
                        acc[filter.by as keyof I] = {
                            lte: filter.value,
                        } as I[keyof I];
                        break;
                    case `not_lte`:
                        acc[filter.by as keyof I] = {
                            not: {
                                lte: filter.value,
                            },
                        } as I[keyof I];
                        break;
                    case `gt`:
                        acc[filter.by as keyof I] = {
                            gt: filter.value,
                        } as I[keyof I];
                        break;
                    case `not_gt`:
                        acc[filter.by as keyof I] = {
                            not: {
                                gt: filter.value,
                            },
                        } as I[keyof I];
                        break;
                    case `gte`:
                        acc[filter.by as keyof I] = {
                            gte: filter.value,
                        } as I[keyof I];
                        break;
                    case `not_gte`:
                        acc[filter.by as keyof I] = {
                            not: {
                                gte: filter.value,
                            },
                        } as I[keyof I];
                        break;
                }
                break;
            }
            default:
                throw new HTTPException(
                    BAD_REQUEST,
                    {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        message: `Invalid filter type: ${ (filter as any).type }`,
                    }
                );
        }
        return acc;
    }, {} as I);
}
