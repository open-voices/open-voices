import { compilePasswordResetEmailTemplate } from "@open-voices/transactional/password-reset-email";
import { compileVerificationEmailTemplate } from "@open-voices/transactional/verification-email";
import { betterAuth } from "better-auth";
import {
    prismaAdapter, type PrismaConfig
} from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import {
    renderMail, sendMail
} from "./mailer.ts";
import { PRISMA } from "./prisma.ts";
import { createAccessControl } from "better-auth/plugins/access";
import {
    defaultStatements, adminAc, userAc
} from "better-auth/plugins/admin/access";

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

const APP_NAME = process.env.APP_NAME ?? `Open Voices`;
const DOMAIN = new URL(process.env.BASE_URL ?? `http://localhost:3000`).hostname;

export type AccessControlPermissions = Partial<{
    website:   Array<`create` | `read` | `update` | `delete` | `list`>
    user:      Array<`create` | `list` | `set-role` | `ban` | `impersonate` | `delete` | `set-password`>
    session:   Array<`list` | `revoke` | `delete`>
    comments:  Array<`create` | `update` | `delete` | `interact` | `admin.list` | `admin.delete` | `admin.update`>
    is_banned: boolean
}>;

const ACCESS_CONTROL = createAccessControl({
    ...defaultStatements,
    website: [
        `create`,
        `read`,
        `update`,
        `delete`,
        `list`,
    ],
    comments: [
        `create`,
        `update`,
        `delete`,
        `interact`,
        `admin.list`,
        `admin.delete`,
        `admin.update`,
    ],
} as const);

const ADMIN_ROLE = ACCESS_CONTROL.newRole({
    ...adminAc.statements,
    website: [
        `create`,
        `read`,
        `update`,
        `delete`,
        `list`,
    ],
    comments: [
        `create`,
        `update`,
        `delete`,
        `interact`,
        `admin.list`,
        `admin.delete`,
        `admin.update`,
    ],
});

const USER_ROLE = ACCESS_CONTROL.newRole({
    ...userAc.statements,
    comments: [
        `create`,
        `update`,
        `delete`,
        `interact`,
    ],
});

// eslint-disable-next-line @typescript-eslint/naming-convention
export const auth = betterAuth({
    appName:           APP_NAME,
    baseURL:           process.env.BASE_URL ?? `http://localhost:3000`,
    secret:            process.env.APP_SECRET,
    basePath:          `/api/auth`,
    trustedOrigins:    process.env.CORS_ORIGINS
                       ? process.env.CORS_ORIGINS.split(`,`)
                       : [ `http://localhost:5173` ],
    database:          prismaAdapter(PRISMA, {
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
            await sendMail({
                to:      user.email,
                subject: `${ APP_NAME } - Reset your password`,
                from:    process.env.SMTP_FROM ?? `no-reply@${ DOMAIN }`,
                html:    renderMail(
                    compilePasswordResetEmailTemplate({
                        app_name:    APP_NAME,
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
            await sendMail({
                to:      user.email,
                subject: `${ APP_NAME } - Verify your email address`,
                from:    process.env.SMTP_FROM ?? `no-reply@${ DOMAIN }`,
                html:    renderMail(
                    compileVerificationEmailTemplate({
                        app_name:         APP_NAME,
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
        admin({
            defaultBanReason:    process.env.DEFAULT_BAN_REASON ?? `Spam or abuse`,
            defaultBanExpiresIn: !isNaN(Number(process.env.DEFAULT_BAN_EXPIRES_IN))
                                 ? Number(process.env.DEFAULT_BAN_EXPIRES_IN)
                                 : undefined,
            bannedUserMessage:   process.env.BAN_MESSAGE ??
                                 // eslint-disable-next-line @stylistic/js/max-len
                                 `You have been banned from this application. If you believe this is a mistake, please contact support.`,
            ac:    ACCESS_CONTROL,
            roles: {
                admin: ADMIN_ROLE,
                user:  USER_ROLE,
            },
        }),
    ],
});

