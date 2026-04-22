import z from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string(),
    AUTH_JWT_SECRET: z.string(),
    RESET_PASSWORD_JWT_SECRET: z.string(),
    RESET_PASSWORD_URL_BASE: z.string(),
    PORT: z.coerce.number().optional(),
    EMAIL_USER: z.string(),
    EMAIL_PASS: z.string(),
    ADMIN_URL: z.string().default('http://localhost:5173'),
})

export const env = envSchema.parse(process.env);

