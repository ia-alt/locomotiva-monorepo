import z from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string(),
    AUTH_JWT_SECRET: z.string(),
    RESET_PASSWORD_JWT_SECRET: z.string(),
    RESET_PASSWORD_URL_BASE: z.string(),
    PORT: z.coerce.number().optional(),
    RESEND_API_KEY: z.string().optional(),
})

export const env = envSchema.parse(process.env);

