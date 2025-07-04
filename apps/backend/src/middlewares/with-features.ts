import type { MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import type { InstallationSettingName, Prisma } from "../generated/prisma";
import { FORBIDDEN } from "../lib/const";
import { PRISMA } from "../lib/prisma";
import type { HonoEnv } from "../types/hono";

type SettingsButFirstSetup = Exclude<
  InstallationSettingName,
  `IS_FIRST_SETUP_COMPLETED`
>;

/**
 * Middleware to check if the required features are enabled.
 * @param {Array<SettingsButFirstSetup>} feature
 * @returns {MiddlewareHandler<HonoEnv>}
 */
export function withFeatures(
  feature: Array<SettingsButFirstSetup>
): MiddlewareHandler<HonoEnv> {
  return checkFeatures(
    feature.reduce(
      (acc, setting) => {
        acc[setting] = true;
        return acc;
      },
      {} as Partial<Record<SettingsButFirstSetup, Prisma.JsonValue>>
    )
  );
}

/**
 * Middleware to check if the required features have the specified values.
 * @param {Partial<Record<SettingsButFirstSetup, JsonValue>>} feature
 * @returns {MiddlewareHandler<HonoEnv>}
 */
export function checkFeatures(
  feature: Partial<Record<SettingsButFirstSetup, Prisma.JsonValue>>
): MiddlewareHandler<HonoEnv> {
  return createMiddleware<HonoEnv>(async (c, next) => {
    const settings = await PRISMA.installationSettings.findMany({
      where: {
        name: {
          in: Object.keys(feature) as Array<InstallationSettingName>,
        },
      },
    });

    for (const setting of settings) {
      const value = feature[setting.name as SettingsButFirstSetup];
      if (value !== undefined && setting.value !== value) {
        return c.json(
          {
            error: `One or more required features are not enabled`,
          },
          FORBIDDEN
        );
      }
    }

    await next();
  });
}
