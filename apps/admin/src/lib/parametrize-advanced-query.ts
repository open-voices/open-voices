import type { ADVANCED_QUERY_SCHEMA } from "@open-voices/validation/advanced-schemas";
import { z } from "zod/v4";

type Schema = z.infer<typeof ADVANCED_QUERY_SCHEMA>;

type ParametrizedQuery = Record<keyof Schema, string | string[] | undefined>;

/**
 * Converts an advanced query schema into a parametrized query object.
 * This function encodes the values of the query parameters to ensure they are safe for use in URLs.
 */
export function parametrizeAdvancedQuery(
    query: Schema,
): ParametrizedQuery {
    return {
        page: !!query.page ? encodeURIComponent(query.page) : undefined,
        limit: !!query.limit ? encodeURIComponent(query.limit) : undefined,
        filters: !!query.filters ? encodeURIComponent(JSON.stringify(query.filters)) : undefined,
        sort: !!query.sort ? encodeURIComponent(JSON.stringify(query.sort)) : undefined, 
    }
}