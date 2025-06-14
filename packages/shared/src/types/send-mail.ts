import type { Options as MailOptions } from "nodemailer/lib/mailer";

export type SendMail = (data: MailOptions) => Promise<void>;
