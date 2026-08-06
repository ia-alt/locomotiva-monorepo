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

    // Storage dos arquivos .stl/.gcode (impressão 3D) — Supabase Storage via SDK.
    // As 3 são obrigatórias na prática: sem elas, o container lança erro ao gerar URLs de upload/download.
    SUPABASE_URL: z.string().optional(),
    SUPABASE_SECRET_KEY: z.string().optional(),
    STORAGE_BUCKET: z.string().optional(),

    // Login Único gov.br (OIDC). Todas OPCIONAIS de propósito: este schema é
    // `.parse()`ado no boot, então torná-las obrigatórias derrubaria a API em
    // todo ambiente que ainda não tem credencial. Quem exige é o GovbrOidcService.
    // O .trim() é essencial: espaço sobrando no id/secret gera 401 e invalid_client.
    GOVBR_ENABLED: z.enum(["true", "false"]).default("false"),
    GOVBR_CLIENT_ID: z.string().trim().optional(),
    GOVBR_CLIENT_SECRET: z.string().trim(),
    GOVBR_ISSUER: z.string().trim().default("https://sso.staging.acesso.gov.br"),
    GOVBR_REDIRECT_URI: z.string().trim().optional(),
    GOVBR_SCOPES: z.string().trim().default("openid email phone profile"),
})

export const env = envSchema.parse(process.env);

