/* v8 ignore start */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */
import type { AppType } from './index';
import { hc } from 'hono/client';

// this is a trick to calculate the type when compiling
const client = hc<AppType>(``);
export type Client = typeof client;

export function makeOpenVoicesClient(...args: Parameters<typeof hc>): Client {
    return hc<AppType>(...args);
}

/* v8 ignore stop */
