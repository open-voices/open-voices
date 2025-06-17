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
// eslint-disable-next-line @typescript-eslint/naming-convention
export function ACL(permissions: Partial<AccessControlPermissions>): MiddlewareHandler<HonoEnv> {
    return createMiddleware<HonoEnv>(async(c, next) => {
        const user = c.get(`user`);

        if (!user) {
            return c.json({
                error: `Authentication required`,
            }, UNAUTHORIZED);
        }

        if (permissions.is_banned !== undefined) {
            if (
                (
                    permissions.is_banned && !user.banned
                ) || (
                    !permissions.is_banned && user.banned
                )
            ) {
                return c.json({
                    error: `You do not have permissions to perform this action`,
                }, FORBIDDEN);
            }

            // Remove is_banned from permissions as it is not a permission
            permissions.is_banned = undefined;
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
