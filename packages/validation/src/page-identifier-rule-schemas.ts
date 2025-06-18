/* v8 ignore start */

import { z } from "zod/v4";

/**
 * Allows a format that can contain placeholders like:
 * - {title($1)}
 * - {dash($1)}
 * - {snake($1)}
 * - {$1}
 * - static text like "Page Title"
 * - alphanumeric characters, dashes, underscores, and spaces
 * - or a combination of these
 *
 * Valid examples:
 * - {title($1)}
 * - {dash($1)}
 * - {snake($1)}
 * - {title($1)} {dash($2)}
 * - {title($1)} {snake($2)}
 * - {title($1)} static {dash($2)} text {snake($3)}
 * - {$1}
 * - static text
 *
 * Invalid examples:
 * - missing closing brace: {title($1) {dash($2)}
 * - invalid characters: {title($1)} {dash($2)} @invalid
 * - empty format: {}
 * - only spaces: {   }
 * - no placeholders or static text: {title} {dash} {snake}
 * - invalid transformation: {rambo($1)}
 */
export const PAGE_IDENTIFIER_FORMAT_REGEX = /^(?:\{(?:title|dash|snake)\(\$\d+\)}|[A-Za-z0-9\-_ ]+|\{\$\d+})+$/g;
export const PAGE_IDENTIFIER_FORMAT_REPLACEMENT_REGEX = /\{(title|dash|snake)\(\$(\d+)\)}|\{\$(\d+)}/g;

export const PAGE_IDENTIFIER_RULE_SCHEMA = z.object({
    url:    z.url(`Invalid URL format`),
    format: z.string().regex(
        PAGE_IDENTIFIER_FORMAT_REGEX,
        `Format must be a valid string with placeholders or static text`
    )
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        .min(1, `Format must not be empty`),
});

export const PAGE_IDENTIFIER_RULES_SCHEMA = z.array(PAGE_IDENTIFIER_RULE_SCHEMA)
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    .min(1, `At least one page identifier rule is required`)
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    .max(10, `A maximum of 10 page identifier rules is allowed`);

/* v8 ignore stop */
