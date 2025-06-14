import { compilePasswordResetEmailTemplate } from "@open-voices/transactional/password-reset-email";
import { compileVerificationEmailTemplate } from "@open-voices/transactional/verification-email";
import type { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import {
    prismaAdapter, type PrismaConfig
} from "better-auth/adapters/prisma";
import {
    admin, bearer, jwt
} from "better-auth/plugins";
import type { RenderMail } from "../types/render-mail.ts";
import type { SendMail } from "../types/send-mail.ts";

export interface MakeAuthConfigOptions {
    prisma:     PrismaClient
    sendMail:   SendMail
    renderMail: RenderMail
}

/**
 * The default minimum password length for user accounts.
 */
const DEFAULT_MIN_PASSWORD_LENGTH = 12;

/**
 * The default rate limit window in seconds.
 * This is used to limit the number of requests a user can make in a given time frame.
 *
 * Default is set to 60 seconds (1 minute).
 */
const DEFAULT_RATE_LIMIT_WINDOW = 60;

/**
 * The default maximum number of requests allowed in the rate limit window.
 * This is used to prevent abuse and ensure fair usage of the API.
 *
 * Default is set to 100 requests per window.
 */
const DEFAULT_RATE_LIMIT_MAX_REQUESTS = 100;

/**
 * Creates an authentication configuration for the application using BetterAuth.
 *
 * @param {MakeAuthConfigOptions} config - The configuration options for the authentication setup.
 * @returns {ReturnType<typeof betterAuth>} The configured BetterAuth instance.
 */
export function makeAuthConfig(config: MakeAuthConfigOptions): ReturnType<typeof betterAuth> {
    const app_name = process.env.APP_NAME ?? `Open Voices`;
    const domain = new URL(process.env.BASE_URL ?? `http://localhost:3000`).hostname;

    return betterAuth({
        appName:           app_name,
        baseURL:           process.env.BASE_URL ?? `http://localhost:3000`,
        secret:            process.env.APP_SECRET,
        basePath:          `/api/auth`,
        database:          prismaAdapter(config.prisma, {
            provider: process.env.DATABASE_PROVIDER &&
                      [
                          `postgresql`,
                          `sqlite`,
                          `cockroachdb`,
                          `mysql`,
                          `sqlserver`,
                          `mongodb`,
                      ].includes(process.env.DATABASE_PROVIDER as string)
                      ? process.env.DATABASE_PROVIDER as PrismaConfig[`provider`]
                      : `postgresql`,
        }),
        emailAndPassword:  {
            enabled:                       true,
            minPasswordLength:             !isNaN(Number(process.env.MIN_PASSWORD_LENGTH))
                                           ? Number(process.env.MIN_PASSWORD_LENGTH)
                                           : DEFAULT_MIN_PASSWORD_LENGTH,
            requireEmailVerification:      !process.env.REQUIRE_EMAIL_VERIFICATION
                                           ? true
                                           : process.env.REQUIRE_EMAIL_VERIFICATION === `true`,
            disableSignUp:                 !process.env.DISABLE_SIGN_UP
                                           ? false
                                           : process.env.DISABLE_SIGN_UP === `true`,
            revokeSessionsOnPasswordReset: true,
            sendResetPassword:             async({
                user,
                url,
            }) => {
                await config.sendMail({
                    to:      user.email,
                    subject: `${ app_name } - Reset your password`,
                    from:    process.env.SMTP_FROM ?? `no-reply@${ domain }`,
                    html:    config.renderMail(
                        compilePasswordResetEmailTemplate({
                            app_name,
                            reset_url:   url,
                            help_url:    process.env.HELP_URL,
                            privacy_url: process.env.PRIVACY_URL,
                            terms_url:   process.env.TERMS_URL,
                        })
                    ),
                });
            },
        },
        rateLimit:         {
            enabled: process.env.RATE_LIMIT_ENABLED
                     ? process.env.RATE_LIMIT_ENABLED !== `false`
                     : process.env.NODE_ENV === `production`,
            window:  process.env.RATE_LIMIT_WINDOW
                     ? parseInt(process.env.RATE_LIMIT_WINDOW, 10)
                     : DEFAULT_RATE_LIMIT_WINDOW,
            max:     process.env.RATE_LIMIT_MAX_REQUESTS
                     ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10)
                     : DEFAULT_RATE_LIMIT_MAX_REQUESTS,
            storage: `database`,
        },
        emailVerification: {
            autoSignInAfterVerification: true,
            sendOnSignUp:                true,
            sendVerificationEmail:       async({
                url,
                user,
            }) => {
                await config.sendMail({
                    to:      user.email,
                    subject: `${ app_name } - Verify your email address`,
                    from:    process.env.SMTP_FROM ?? `no-reply@${ domain }`,
                    html:    config.renderMail(
                        compileVerificationEmailTemplate({
                            app_name,
                            verification_url: url,
                            help_url:         process.env.HELP_URL,
                            privacy_url:      process.env.PRIVACY_URL,
                            terms_url:        process.env.TERMS_URL,
                        })
                    ),
                });
            },
        },
        plugins:           [
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
                bannedUserMessage:   process.env.BAN_MESSAGE ??
                                     // eslint-disable-next-line @stylistic/js/max-len
                                     `You have been banned from this application. If you believe this is a mistake, please contact support.`,
            }),
        ],
    });
}
