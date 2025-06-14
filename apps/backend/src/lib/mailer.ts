import mjml2html from "mjml";
import { promisify } from "node:util";
import {
    createTestAccount as _createTestAccount,
    createTransport,
    getTestMessageUrl,
    type TestAccount,
    type Transporter
} from "nodemailer";
import type { Options as MailOptions } from "nodemailer/lib/mailer";
import type {
    Options, SentMessageInfo
} from "nodemailer/lib/smtp-transport";

// eslint-disable-next-line @typescript-eslint/naming-convention
const createTestAccount = promisify<TestAccount>(_createTestAccount);

/**
 * Determines if the SMTP configuration is incomplete and should fall back to Ethereal.
 */
const SHOULD_SETUP_ETHEREAL = !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS;

export async function sendMail(data: MailOptions): Promise<void> {
    const transport = await makeTransport();

    const info = await transport.sendMail(data);

    console.log(`Email sent: ${ info.messageId }`);
    if (SHOULD_SETUP_ETHEREAL) {
        console.log(`Ethereal email sent:`, getTestMessageUrl(info));
    }
}

/**
 * SMTP secure port constant (usually for SSL/TLS connections).
 */
const SMTP_SECURE_PORT = 465;

/**
 * Length of the banner to be displayed in the console.
 */
const BANNER_LENGTH = 30;

async function makeTransport(): Promise<Transporter<SentMessageInfo, Options>> {
    let ethereal: TestAccount | undefined;
    if (SHOULD_SETUP_ETHEREAL) {
        console.warn(`-`.repeat(BANNER_LENGTH));
        console.warn(`SMTP configuration is incomplete. Falling back to test configuration using Ethereal.`);
        console.warn(
            `Please set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables to use your own SMTP server.`
        );
        console.warn(`NOTE: all temporary email links will be printed to the console.`);
        console.warn(`-`.repeat(BANNER_LENGTH));

        ethereal = await createTestAccount();
    }

    const port = parseInt(process.env.SMTP_PORT ?? `587`, 10);

    return createTransport({
        host:   SHOULD_SETUP_ETHEREAL ? ethereal?.smtp.host : process.env.SMTP_HOST,
        port,
        secure: port === SMTP_SECURE_PORT,
        auth:   {
            user: SHOULD_SETUP_ETHEREAL ? ethereal?.user : process.env.SMTP_USER,
            pass: SHOULD_SETUP_ETHEREAL ? ethereal?.pass : process.env.SMTP_PASS,
        },
    });
}

/**
 * Renders an email template using MJML.
 * @param {string} template
 */
export function renderMail(template: string): string {
    return mjml2html(template, {
        keepComments: false,
        minify:       true,
    }).html;
}
