import type { MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import {
    type AccessControlPermissions, auth
} from "../lib/auth.ts";
import {
    FORBIDDEN, UNAUTHORIZED
} from "../lib/const.ts";
import type { HonoEnv } from "../types/hono.ts";

/**
 * Middleware to check if the user has the required permissions.
 * @param {Partial<AccessControlPermissions>} permissions
 * @returns {MiddlewareHandler<HonoEnv>}
 */
export function userHasPermission(permissions: Partial<AccessControlPermissions>): MiddlewareHandler<HonoEnv> {
    return createMiddleware<HonoEnv>(async(c, next) => {
        const user = c.get(`user`);

        if (!user) {
            return c.json({
                error: `Authentication required`,
            }, UNAUTHORIZED);
        }

        const response = await auth.api.userHasPermission({
            body: {
                userId:      user.id,
                permissions,
            },
        });

        if (!response.success) {
            return c.json({
                error: `You do not have permissions to perform this action`,
            }, FORBIDDEN);
        }

        await next();
    });
}
