import { z } from "zod/v4";
import { PAGE_IDENTIFIER_RULES_SCHEMA } from "./page-identifier-rule-schemas.ts";

export const CREATE_WEBSITE_SCHEMA = z.object({
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    name:                  z.string().min(5, `Name must be at least 5 characters long`),
    url:                   z.url(`Invalid URL format`),
    description:           z.string().optional(),
    page_identifier_rules: PAGE_IDENTIFIER_RULES_SCHEMA,
});

export const UPDATE_WEBSITE_SCHEMA = CREATE_WEBSITE_SCHEMA.partial()