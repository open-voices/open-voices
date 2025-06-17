import {
    PAGE_IDENTIFIER_FORMAT_REPLACEMENT_REGEX,
    type PAGE_IDENTIFIER_RULE_SCHEMA,
    PAGE_IDENTIFIER_RULES_SCHEMA
} from "@open-voices/validation/page-identifier-rule-schemas";
import { HTTPException } from "hono/http-exception";
import { match } from "path-to-regexp";
import {
    dash, isEmpty, snake, title
} from "radash";
import type { z } from "zod/v4";
import type { Website } from "../generated/prisma";
import { INTERNAL_SERVER_ERROR } from "./const.ts";

const NORMALIZE_INDEX = 1;

/**
 * Converts a glob pattern to a regular expression pattern.
 * @param {string} glob
 * @returns {string}
 */
function globToRegexpPattern(glob: string): string {
    // Replace ** with :param(.*) and * with :param([^/]+)
    return glob
        .replace(/\*\*/g, `:param(.*)`)
        .replace(/\*/g, `:param([^/]+)`);
}

/**
 * Extracts matches from a URL based on a glob pattern.
 * @param {string} pattern
 * @param {string} url
 * @returns {Array<string> | null}
 */
function extractMatches(pattern: string, url: string): Array<string> {
    const regexp_pattern = globToRegexpPattern(pattern);
    const matcher = match(regexp_pattern, {
        decode: decodeURIComponent,
    });
    const result = matcher(url);
    if (!result) {
        return [];
    }

    // Flatten all param values into a single array
    return Object.values(result.params).flat()
        .filter(Boolean) as Array<string>;
}

/**
 * Finds the best URL match for a given website and URL. (aka the longest match)
 * @param {Website} website
 * @param {string} url
 * @returns {Array<string>}
 */
function getBestUrlMatch(website: Website, url: string): {
    longest_match: Array<string>
    best_rule:     z.infer<typeof PAGE_IDENTIFIER_RULE_SCHEMA> | null
} {
    const validated = PAGE_IDENTIFIER_RULES_SCHEMA.safeParse(website.page_identifier_rules);
    if (!validated.success) {
        throw new HTTPException(
            INTERNAL_SERVER_ERROR,
            {
                message: `Invalid page identifier rules for website ${ website.id }: ${ validated.error.message }`,
            }
        );
    }

    let longest_match: Array<string> = [];
    let best_rule: z.infer<typeof PAGE_IDENTIFIER_RULE_SCHEMA> | null = null;

    for (const rule of validated.data) {
        const matches = extractMatches(rule.url, url);
        if (matches && (
            !longest_match || matches.length > longest_match.length
        )) {
            longest_match = matches;
            best_rule = rule;
        }
    }

    return {
        longest_match: longest_match ?? [],
        best_rule:     best_rule,
    };
}

/**
 * Formats a URL match based on the best match found in the website's page identifier rules.
 * If no match is found, null is returned and the record is considered discarded.
 *
 * @param {Website} website
 * @param {string} url
 * @returns {string | null}
 */
export function formatUrlMatch(
    website: Website,
    url: string
): string | null {
    const matches = getBestUrlMatch(website, url);
    if (isEmpty(matches.longest_match) || !matches.best_rule) {
        return null;
    }

    const {
        format,
    } = matches.best_rule;
    const formatted = format.replaceAll(
        PAGE_IDENTIFIER_FORMAT_REPLACEMENT_REGEX,
        // eslint-disable-next-line @typescript-eslint/max-params
        (_, transform, idx1, idx2) => {
            // idx1 is for {transform($n)}, idx2 is for {$n}
            const index = parseInt(idx1 ?? idx2, 10) - NORMALIZE_INDEX;
            let value = matches.longest_match[index] ?? ``;

            if (transform) {
                switch (transform) {
                    case `title`:
                        value = title(value);
                        break;
                    case `dash`:
                        value = dash(value);
                        break;
                    case `snake`:
                        value = snake(value);
                        break;
                }
            }
            return value;
        }
    );

    // Remove any unmatched placeholders and trim
    return formatted.replace(/\{.*?}/g, ``).trim() || null;
}

