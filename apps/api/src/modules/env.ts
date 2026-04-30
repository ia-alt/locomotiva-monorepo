import z from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string(),
    AUTH_JWT_SECRET: z.string(),
    RESET_PASSWORD_JWT_SECRET: z.string(),
    RESET_PASSWORD_URL_BASE: z.string(),
    PORT: z.coerce.number().optional(),
    NODEMAILER_EMAIL_USER: z.string(),
    NODEMAILER_EMAIL_PASS: z.string(),
    ADMIN_URL: z.string(),
    GOOGLE_CALENDAR_ID: z.string(),
    GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string(),
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string(),
})

export const env = envSchema.parse(process.env);

