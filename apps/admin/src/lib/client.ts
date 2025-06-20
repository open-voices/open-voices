/* v8 ignore start */
import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";
import { makeOpenVoicesClient } from "@open-voices/backend/client";
import { QueryClient } from "@tanstack/react-query";
import { dayjs } from "./dayjs";

const TOO_MANY_REQUESTS = 429;

export const AUTH_CLIENT = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_BASE_URL ?? `http://localhost:3000/`,
  fetchOptions: {
    credentials: `include`,
    onError: async (context) => {
      const { response } = context;
      if (response.status === TOO_MANY_REQUESTS) {
        const retry_after = response.headers.get(`X-Retry-After`);
        console.log(`Rate limit exceeded. Retry after ${retry_after} seconds`);
      }
    },
  },
  plugins: [adminClient()],
});

export const API_CLIENT = makeOpenVoicesClient(
  import.meta.env.VITE_AUTH_BASE_URL ?? `http://localhost:3000/`,
  {
    init: {
      credentials: "include",
    },
  }
);

export const QUERY_CLIENT = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      networkMode: "online",
      gcTime: dayjs.duration({minutes: 5}).asMilliseconds(),
    },
    mutations: {
      networkMode: "online",
      gcTime: dayjs.duration({minutes: 5}).asMilliseconds(),
    }
  },
})

/* v8 ignore stop */
