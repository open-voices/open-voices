import type { API_CLIENT } from "../lib/client";
import type { ExtractClientMethodReturn } from "./hono-client-helper";
import { z } from "zod/v4";
import { PAGE_IDENTIFIER_RULES_SCHEMA } from "@open-voices/validation/page-identifier-rule-schemas";

export type GetWebsitesListResponse = ExtractClientMethodReturn<typeof API_CLIENT.api.websites, "$get">

export type Website = Omit<
  ExtractClientMethodReturn<typeof API_CLIENT.api.websites, "$get">["websites"][number],
  "page_identifier_rules"
> & {
    page_identifier_rules: z.infer<typeof PAGE_IDENTIFIER_RULES_SCHEMA>
}

export type Websites = Array<Website>;