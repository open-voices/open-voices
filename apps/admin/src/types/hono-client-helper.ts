import type { ClientResponse } from "hono/client";

// Extract the return type from the promise returned by the client method
export type ExtractClientMethodReturn<
  T,
  M extends "$get" | "$post" | "$put" | "$delete",
> = T extends {
  [K in M]: (...args: any[]) => Promise<infer R>;
}
  ? R extends ClientResponse<infer U>
    ? U
    : never
  : never;