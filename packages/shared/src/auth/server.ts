import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import type { PrismaClient } from "@prisma/client";
import {
    admin,
    bearer, jwt
} from "better-auth/plugins";

export function makeAuthConfig(prisma: PrismaClient): ReturnType<typeof betterAuth> {
    return betterAuth({
        appName:  process.env.APP_NAME ?? `Open Voices`,
        baseURL:  process.env.BASE_URL ?? `http://localhost:3000`,
        secret:   process.env.APP_SECRET,
        basePath: `/api/auth`,
        database: prismaAdapter(prisma, {
            provider: `postgresql`,
        }),
        emailAndPassword: {
            enabled: true,
            
        },
        plugins: [
            bearer({
                requireSignature: true,
            }),
            jwt({
                jwks: {
                    keyPairConfig: {
                        alg: `EdDSA`,
                        crv: `Ed25519`,
                    },
                },
            }),
            admin({
                defaultBanReason:    process.env.DEFAULT_BAN_REASON ?? `Spam or abuse`,
                defaultBanExpiresIn: !isNaN(Number(process.env.DEFAULT_BAN_EXPIRES_IN))
                ? Number(process.env.DEFAULT_BAN_EXPIRES_IN)
                : undefined,
                bannedUserMessage: process.env.BAN_MESSAGE ??
                `You have been banned from this application. If you believe this is a mistake, please contact support.`,
            }),
        ],
    });
}
